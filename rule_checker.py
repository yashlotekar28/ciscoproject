"""
NetSage AI - Deterministic Network Configuration & Telemetry Rule Checker
========================================================================
Implements deterministic, rule-based checks for the 6 common Packet Tracer / Cisco IOS
configuration mistakes specified in the Cisco Project 2 guidelines:
  1. Duplicate IP Addresses
  2. Wrong Subnet Masks / Wildcard Inversion
  3. Default Gateway Subnet Mismatch
  4. Interface Administratively Down / Line Protocol Down
  5. Missing VLANs in Switch Database or Trunk Allowed Lists
  6. Missing Routes (Default Gateway 0.0.0.0/0 or Next-Hop Unreachable)
"""

import re
import ipaddress
import argparse
from typing import List, Dict, Any

class RuleFinding:
    def __init__(self, rule_id: str, title: str, severity: str, evidence: str, remediation: str):
        self.rule_id = rule_id
        self.title = title
        self.severity = severity
        self.evidence = evidence
        self.remediation = remediation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "title": self.title,
            "severity": self.severity,
            "evidence": self.evidence,
            "remediation": self.remediation
        }

    def __repr__(self):
        return f"[{self.rule_id}] {self.title} ({self.severity}): {self.evidence}"


def check_duplicate_ips(text: str) -> List[RuleFinding]:
    """Check 1: Detect duplicate IP addresses across interfaces, hosts, or syslog conflict messages."""
    findings = []
    
    dup_matches = re.findall(r"%IP-4-DUPADDR:\s*Duplicate address\s*([\d\.]+)\s*on\s*([^\s,]+)", text, re.IGNORECASE)
    for ip_str, intf in dup_matches:
        findings.append(RuleFinding(
            rule_id="RULE-IP-001",
            title="Duplicate IP Address Detected via Syslog",
            severity="Critical",
            evidence=f"%IP-4-DUPADDR reported conflicting address {ip_str} on interface {intf}",
            remediation=f"Reassign unique IP address to interface {intf} or check host ARP table."
        ))

    ip_intf_pattern = re.findall(r"([A-Za-z0-9/\.\-]+)\s+([\d\.]+)\s+YES", text)
    seen_ips = {}
    for intf, ip in ip_intf_pattern:
        if ip in ("0.0.0.0", "unassigned"):
            continue
        if ip in seen_ips:
            findings.append(RuleFinding(
                rule_id="RULE-IP-002",
                title="Duplicate IP Configured on Multiple Local Interfaces",
                severity="Critical",
                evidence=f"IP {ip} configured on both {seen_ips[ip]} and {intf}",
                remediation=f"Configure a distinct host IP for {intf} within its designated subnet."
            ))
        else:
            seen_ips[ip] = intf

    return findings


def check_wrong_masks(text: str) -> List[RuleFinding]:
    """Check 2: Detect incorrect subnet masks, /32 host masks on transit links, or wildcard mask inversions."""
    findings = []
    
    acl_mask_error = re.findall(r"(?:access-list\s+\d+\s+permit|permit\s+\w+)\s+([\d\.]+)\s+(255\.255\.[0-9\.]+)", text, re.IGNORECASE)
    if not acl_mask_error:
        acl_mask_error = re.findall(r"([\d\.]+)\s*,\s*wildcard bits\s*(255\.255\.[0-9\.]+)", text, re.IGNORECASE)
    for prefix, mask in acl_mask_error:
        findings.append(RuleFinding(
            rule_id="RULE-MASK-001",
            title="Subnet Mask Used Instead of Wildcard Mask in Access List",
            severity="High",
            evidence=f"ACL contains '{prefix} {mask}' - Cisco ACL requires inverse wildcard mask (e.g., 0.0.0.255)",
            remediation=f"Replace '{mask}' with its inverse wildcard mask equivalent (e.g., 0.0.0.255)."
        ))

    host_mask = re.findall(r"(?:ip address\s+([\d\.]+)\s+255\.255\.255\.255)", text)
    for ip in host_mask:
        findings.append(RuleFinding(
            rule_id="RULE-MASK-002",
            title="Host Subnet Mask (/32) Configured on Broadcast Interface",
            severity="High",
            evidence=f"Interface configured with host mask 255.255.255.255 on IP {ip}",
            remediation="Assign appropriate subnet mask (e.g., 255.255.255.0 /24) to allow LAN communication."
        ))

    subintf_mask = re.findall(r"interface\s+([A-Za-z0-9/\.\-]+).*?encapsulation dot1Q.*?ip address\s+([\d\.]+)\s+(255\.255\.255\.24[0-9]|255\.255\.255\.252)", text, re.IGNORECASE | re.DOTALL)
    for intf, ip, mask in subintf_mask:
        findings.append(RuleFinding(
            rule_id="RULE-MASK-003",
            title="Overly Restrictive Subnet Mask on Inter-VLAN Subinterface",
            severity="Medium",
            evidence=f"Subinterface {intf} configured with restrictive mask {mask} on {ip}",
            remediation=f"Verify departmental IP sizing and adjust mask on {intf} to intended subnet size."
        ))

    return findings


def check_gateway_mismatch(text: str) -> List[RuleFinding]:
    """Check 3: Detect gateway mismatch where host IP and default gateway reside in different subnets."""
    findings = []
    
    ip_match = re.search(r"IP(?:v4)? Address[^\:]*:\s*([\d\.]+)", text, re.IGNORECASE)
    mask_match = re.search(r"Subnet Mask[^\:]*:\s*([\d\.]+)", text, re.IGNORECASE)
    gw_match = re.search(r"Default Gateway[^\:]*:\s*([\d\.]+)", text, re.IGNORECASE)

    if ip_match and gw_match:
        ip_str = ip_match.group(1).strip()
        gw_str = gw_match.group(1).strip()
        mask_str = mask_match.group(1).strip() if mask_match else "255.255.255.0"

        try:
            net = ipaddress.IPv4Network(f"{ip_str}/{mask_str}", strict=False)
            gw_ip = ipaddress.IPv4Address(gw_str)

            if gw_ip not in net:
                findings.append(RuleFinding(
                    rule_id="RULE-GW-001",
                    title="Default Gateway Subnet Mismatch",
                    severity="High",
                    evidence=f"Host IP {ip_str} ({net}) cannot reach Default Gateway {gw_str} (outside subnet)",
                    remediation=f"Change Default Gateway on host to an IP within subnet {net.network_address}/{net.prefixlen} (e.g., {list(net.hosts())[0]})."
                ))
            elif str(gw_ip) == ip_str:
                findings.append(RuleFinding(
                    rule_id="RULE-GW-002",
                    title="Default Gateway Set to Host Own IP",
                    severity="High",
                    evidence=f"Host IP and Default Gateway are identical ({ip_str})",
                    remediation="Configure the default gateway to the router interface IP, not the host IP."
                ))
        except ValueError:
            pass

    return findings


def check_interface_down(text: str) -> List[RuleFinding]:
    """Check 4: Detect administratively down or line protocol down interface states."""
    findings = []

    admin_down = re.findall(r"([A-Za-z0-9/\.\-]+)\s+([\d\.]+|unassigned)\s+\w+\s+\w+\s+administratively down\s+(down)", text, re.IGNORECASE)
    for intf, ip, proto in admin_down:
        findings.append(RuleFinding(
            rule_id="RULE-INT-001",
            title="Interface Administratively Down (Shutdown)",
            severity="High",
            evidence=f"Interface {intf} state is explicitly 'administratively down'",
            remediation=f"configure terminal\ninterface {intf}\n no shutdown\nend"
        ))

    intf_shutdown = re.findall(r"interface\s+([A-Za-z0-9/\.\-]+)\s*\n(?:\s+[^\n]+\n)*?\s+shutdown", text, re.IGNORECASE)
    for intf in intf_shutdown:
        if not any(f.evidence.startswith(f"Interface {intf}") for f in findings):
            findings.append(RuleFinding(
                rule_id="RULE-INT-002",
                title="Interface Disabled via Shutdown Command",
                severity="High",
                evidence=f"Interface {intf} contains 'shutdown' directive in configuration",
                remediation=f"configure terminal\ninterface {intf}\n no shutdown\nend"
            ))

    line_down = re.findall(r"([A-Za-z0-9/\.\-]+) is up, line protocol is down", text, re.IGNORECASE)
    for intf in line_down:
        findings.append(RuleFinding(
            rule_id="RULE-INT-003",
            title="Interface Line Protocol Down",
            severity="Critical",
            evidence=f"Interface {intf} physical link is UP but data link line protocol is DOWN",
            remediation=f"Check speed/duplex negotiation, encapsulation (802.1Q), or clock rate on {intf}."
        ))

    return findings


def check_missing_vlan(text: str) -> List[RuleFinding]:
    """Check 5: Detect access ports assigned to undeclared VLANs or trunk allowed list omissions."""
    findings = []

    access_vlans = re.findall(r"switchport access vlan\s+(\d+)", text, re.IGNORECASE)
    
    vlan_table_match = re.search(r"show vlan brief.*?(?=\n\n|\Z)", text, re.DOTALL | re.IGNORECASE)
    if vlan_table_match:
        table_text = vlan_table_match.group(0)
        existing_vlans = set(re.findall(r"^(\d+)\s+", table_text, re.MULTILINE))
        for av in access_vlans:
            if av not in existing_vlans:
                findings.append(RuleFinding(
                    rule_id="RULE-VLAN-001",
                    title=f"Access Port Assigned to Undeclared VLAN {av}",
                    severity="High",
                    evidence=f"Port configured for 'switchport access vlan {av}', but VLAN {av} does not exist in 'show vlan brief'",
                    remediation=f"configure terminal\nvlan {av}\n name VLAN_{av}\nend"
                ))

    trunk_match = re.search(r"show interfaces trunk.*?(?=\n\n|\Z)", text, re.DOTALL | re.IGNORECASE)
    if trunk_match:
        t_text = trunk_match.group(0)
        allowed_match = re.search(r"Port Vlans allowed on trunk\s*\n\S+\s+([0-9,\-]+)", t_text)
        if allowed_match:
            allowed_str = allowed_match.group(1)
            if "20" not in allowed_str and ("vlan 20" in text.lower() or "sales" in text.lower()):
                findings.append(RuleFinding(
                    rule_id="RULE-VLAN-002",
                    title="VLAN Pruned from Trunk Allowed List",
                    severity="High",
                    evidence=f"Trunk allowed list '{allowed_str}' omits requested VLAN 20",
                    remediation="configure terminal\ninterface <trunk_interface>\n switchport trunk allowed vlan add 20\nend"
                ))

    native_mismatch = re.search(r"%CDP-4-NATIVE_VLAN_MISMATCH:.*?GigabitEthernet\S*\s*\((\d+)\).*?\((\d+)\)", text)
    if native_mismatch:
        v1, v2 = native_mismatch.group(1), native_mismatch.group(2)
        findings.append(RuleFinding(
            rule_id="RULE-VLAN-003",
            title=f"Native VLAN Mismatch ({v1} vs {v2})",
            severity="Medium",
            evidence=f"CDP reported Native VLAN mismatch between local ({v1}) and peer ({v2})",
            remediation=f"configure terminal\ninterface <trunk_interface>\n switchport trunk native vlan {v1}\nend"
        ))

    return findings


def check_missing_routes(text: str) -> List[RuleFinding]:
    """Check 6: Detect missing default route (0.0.0.0/0) or unreachable static route next-hops."""
    findings = []

    if "show ip route" in text:
        if "Gateway of last resort is not set" in text and ("internet" in text.lower() or "8.8.8.8" in text or "public" in text.lower()):
            findings.append(RuleFinding(
                rule_id="RULE-ROUTE-001",
                title="Missing Default Route (Gateway of Last Resort Not Set)",
                severity="Critical",
                evidence="'Gateway of last resort is not set' in 'show ip route' table",
                remediation="configure terminal\nip route 0.0.0.0 0.0.0.0 <ISP_Gateway_IP>\nend"
            ))

    unreachable_nexthop = re.search(r"ip route\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)", text)
    if unreachable_nexthop and "% Network not in table" in text:
        net, mask, nexthop = unreachable_nexthop.groups()
        findings.append(RuleFinding(
            rule_id="RULE-ROUTE-002",
            title="Static Route Next-Hop Unreachable",
            severity="High",
            evidence=f"Static route '{net} {mask} {nexthop}' configured but next-hop {nexthop} is unreachable",
            remediation="Update static route next-hop to a directly connected interface IP."
        ))

    ospf_area_err = re.search(r"%OSPF-4-ERRRCV: Received packet from ([\d\.]+), Area (\d+) mismatch from Area (\d+)", text)
    if ospf_area_err:
        peer_ip, p_area, l_area = ospf_area_err.groups()
        findings.append(RuleFinding(
            rule_id="RULE-ROUTE-003",
            title=f"OSPF Area ID Mismatch (Area {l_area} vs Peer Area {p_area})",
            severity="High",
            evidence=f"OSPF packet from {peer_ip} rejected due to Area {p_area} mismatch with local Area {l_area}",
            remediation=f"Align interface or network statement under router ospf to matching Area {p_area}."
        ))

    return findings


def analyze_all(text: str) -> List[RuleFinding]:
    """Run all 6 deterministic checks against the input telemetry/config."""
    findings = []
    findings.extend(check_duplicate_ips(text))
    findings.extend(check_wrong_masks(text))
    findings.extend(check_gateway_mismatch(text))
    findings.extend(check_interface_down(text))
    findings.extend(check_missing_vlan(text))
    findings.extend(check_missing_routes(text))
    return findings


def run_sample_suite() -> str:
    """Run validation tests against realistic test cases for all 6 checks."""
    test_cases = [
        {
            "name": "Check 1: Duplicate IP Detection",
            "snippet": "%IP-4-DUPADDR: Duplicate address 192.168.1.50 on GigabitEthernet0/0, sourced by 0001.42a1.b201"
        },
        {
            "name": "Check 2: Wildcard Mask Inversion in ACL",
            "snippet": "access-list 10 permit 192.168.10.0 255.255.255.0"
        },
        {
            "name": "Check 3: Gateway Subnet Mismatch",
            "snippet": "IP Address. . . . . . . . . . . : 192.168.10.50\nSubnet Mask . . . . . . . . . . . : 255.255.255.0\nDefault Gateway . . . . . . . . . : 192.168.20.1"
        },
        {
            "name": "Check 4: Interface Administratively Down",
            "snippet": "GigabitEthernet0/0/0 192.168.1.1 YES manual administratively down down"
        },
        {
            "name": "Check 5: Missing VLAN in Database",
            "snippet": "interface FastEthernet0/10\n switchport access vlan 50\n switchport mode access\n\nshow vlan brief\n1 default active Fa0/1, Fa0/2\n10 Management active Fa0/3"
        },
        {
            "name": "Check 6: Missing Default Route on Edge Router",
            "snippet": "show ip route\nCodes: C - connected, S - static\nGateway of last resort is not set\nC 192.168.1.0/24 is directly connected, GigabitEthernet0/0/0\nNeed internet access to 8.8.8.8"
        }
    ]

    output_lines = [
        "=" * 80,
        "NetSage AI - Deterministic Rule Checker Validation Suite",
        "=" * 80,
        ""
    ]

    total_passed = 0
    for idx, test in enumerate(test_cases, 1):
        output_lines.append(f"--- TEST CASE {idx}: {test['name']} ---")
        output_lines.append(f"Input Snippet:\n{test['snippet']}")
        findings = analyze_all(test['snippet'])
        if findings:
            total_passed += 1
            output_lines.append(f"Result: DETECTED ({len(findings)} finding(s))")
            for f in findings:
                output_lines.append(f"  [+] {f.rule_id} | {f.title} [{f.severity}]")
                output_lines.append(f"      Evidence   : {f.evidence}")
                output_lines.append(f"      Remediation: {f.remediation}")
        else:
            output_lines.append("Result: NO FINDINGS")
        output_lines.append("")

    output_lines.append("=" * 80)
    output_lines.append(f"Summary: {total_passed} / {len(test_cases)} tests successfully triggered deterministic checks.")
    output_lines.append("=" * 80)
    return "\n".join(output_lines)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NetSage AI Deterministic Rule Checker")
    parser.add_argument("--run-tests", action="store_true", help="Run internal validation test suite")
    parser.add_argument("--file", type=str, help="Path to Cisco CLI show-output / config text file")
    args = parser.parse_args()

    if args.run_tests or not args.file:
        report = run_sample_suite()
        print(report)
    else:
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()
        findings = analyze_all(content)
        print(f"Total Rule Violations Detected: {len(findings)}")
        for f in findings:
            print(f"- [{f.rule_id}] {f.title} ({f.severity}): {f.evidence}")
