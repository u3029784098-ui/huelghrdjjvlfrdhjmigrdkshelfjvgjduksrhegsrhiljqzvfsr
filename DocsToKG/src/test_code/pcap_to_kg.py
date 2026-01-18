from scapy.all import rdpcap, IP, TCP, UDP, ICMP, ARP, DNS, Raw, Ether
from neo4j import GraphDatabase
from datetime import datetime
from typing import Dict, List, Any, Optional
import hashlib
import json


class PCAPToNeo4jKG:
    """
    Transform PCAP files into Neo4j Knowledge Graph.
    Extracts protocol-specific features and creates nodes/relationships.
    """
    
    def __init__(self, uri: str, user: str, password: str, database: str):
        """
        Initialize Neo4j connection.
        
        Args:
            uri: Neo4j database URI (e.g., 'bolt://localhost:7687')
            user: Database username
            password: Database password
        """
        self.driver = GraphDatabase.driver(uri, auth=(user, password), database=database)
        self._create_constraints()
    
    def close(self):
        """Close Neo4j driver connection."""
        self.driver.close()
    
    def _create_constraints(self):
        """Create uniqueness constraints for node types."""
        constraints = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Packet) REQUIRE p.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (ip:IPAddress) REQUIRE ip.address IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (port:Port) REQUIRE port.number IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (mac:MACAddress) REQUIRE mac.address IS UNIQUE",
        ]
        
        with self.driver.session() as session:
            for constraint in constraints:
                try:
                    session.run(constraint)
                except Exception as e:
                    print(f"Constraint creation note: {e}")
    
    def process_pcap(self, pcap_file: str, session_id: Optional[str] = None):
        """
        Process PCAP file and create knowledge graph.
        
        Args:
            pcap_file: Path to PCAP file
            session_id: Optional session identifier for grouping packets
        """
        packets = rdpcap(pcap_file)
        
        if session_id is None:
            session_id = hashlib.md5(pcap_file.encode()).hexdigest()[:8]
        
        print(f"Processing {len(packets)} packets from {pcap_file}")
        
        for idx, packet in enumerate(packets):
            packet_id = f"{session_id}_{idx}"
            self._process_packet(packet, packet_id, idx)
        
        print(f"Successfully processed {len(packets)} packets into Neo4j KG")
    
    def _process_packet(self, packet, packet_id: str, seq_num: int):
        """Process individual packet and extract all protocol layers."""
        with self.driver.session() as session:
            # Create base packet node
            packet_props = self._extract_base_packet_features(packet, packet_id, seq_num)
            session.run(
                """
                CREATE (p:Packet $props)
                """,
                props=packet_props
            )
            
            # Process Ethernet layer
            if packet.haslayer(Ether):
                self._process_ethernet(session, packet, packet_id)
            
            # Process IP layer
            if packet.haslayer(IP):
                self._process_ip(session, packet, packet_id)
            
            # Process TCP layer
            if packet.haslayer(TCP):
                self._process_tcp(session, packet, packet_id)
            
            # Process UDP layer
            if packet.haslayer(UDP):
                self._process_udp(session, packet, packet_id)
            
            # Process ICMP layer
            if packet.haslayer(ICMP):
                self._process_icmp(session, packet, packet_id)
            
            # Process ARP layer
            if packet.haslayer(ARP):
                self._process_arp(session, packet, packet_id)
            
            # Process DNS layer
            if packet.haslayer(DNS):
                self._process_dns(session, packet, packet_id)
            
            # Process Raw/Payload
            if packet.haslayer(Raw):
                self._process_payload(session, packet, packet_id)
    
    def _extract_base_packet_features(self, packet, packet_id: str, seq_num: int) -> Dict:
        """Extract base packet features."""
        return {
            'id': packet_id,
            'sequence_number': seq_num,
            'timestamp': float(packet.time),
            'length': len(packet),
            'protocols': self._get_protocol_stack(packet)
        }
    
    def _get_protocol_stack(self, packet) -> List[str]:
        """Get list of protocols in packet."""
        protocols = []
        layer = packet
        while layer:
            protocols.append(layer.name)
            layer = layer.payload if hasattr(layer, 'payload') else None
        return protocols
    
    def _process_ethernet(self, session, packet, packet_id: str):
        """Process Ethernet layer."""
        eth = packet[Ether]
        
        eth_features = {
            'src': eth.src,
            'dst': eth.dst,
            'type': eth.type,
            'type_name': self._get_ether_type_name(eth.type)
        }
        
        # Create MAC address nodes
        session.run(
            """
            MATCH (p:Packet {id: $packet_id})
            MERGE (src:MACAddress {address: $src})
            MERGE (dst:MACAddress {address: $dst})
            CREATE (p)-[:HAS_ETHERNET_LAYER $props]->(eth:EthernetLayer)
            CREATE (eth)-[:SOURCE_MAC]->(src)
            CREATE (eth)-[:DESTINATION_MAC]->(dst)
            """,
            packet_id=packet_id,
            src=eth_features['src'],
            dst=eth_features['dst'],
            props=eth_features
        )
    
    def _process_ip(self, session, packet, packet_id: str):
        """Process IP layer with detailed features."""
        ip = packet[IP]
        
        ip_features = {
            'src': ip.src,
            'dst': ip.dst,
            'version': ip.version,
            'ihl': ip.ihl,
            'tos': ip.tos,
            'ttl': ip.ttl,
            'protocol': ip.proto,
            'protocol_name': self._get_ip_protocol_name(ip.proto),
            'length': ip.len,
            'id': ip.id,
            'flags': int(ip.flags),
            'frag': ip.frag,
            'chksum': ip.chksum
        }
        
        session.run(
            """
            MATCH (p:Packet {id: $packet_id})
            MERGE (src:IPAddress {address: $src})
            MERGE (dst:IPAddress {address: $dst})
            CREATE (p)-[:HAS_IP_LAYER $props]->(ip_layer:IPLayer)
            CREATE (ip_layer)-[:SOURCE_IP]->(src)
            CREATE (ip_layer)-[:DESTINATION_IP]->(dst)
            CREATE (src)-[:COMMUNICATED_WITH {packet_id: $packet_id}]->(dst)
            """,
            packet_id=packet_id,
            src=ip_features['src'],
            dst=ip_features['dst'],
            props=ip_features
        )
    
    def _process_tcp(self, session, packet, packet_id: str):
        """Process TCP layer with all flags and features."""
        tcp = packet[TCP]
        
        tcp_features = {
            'sport': tcp.sport,
            'dport': tcp.dport,
            'seq': tcp.seq,
            'ack': tcp.ack,
            'dataofs': tcp.dataofs,
            'reserved': tcp.reserved,
            'flags': str(tcp.flags),
            'flag_fin': bool(tcp.flags & 0x01),
            'flag_syn': bool(tcp.flags & 0x02),
            'flag_rst': bool(tcp.flags & 0x04),
            'flag_psh': bool(tcp.flags & 0x08),
            'flag_ack': bool(tcp.flags & 0x10),
            'flag_urg': bool(tcp.flags & 0x20),
            'window': tcp.window,
            'chksum': tcp.chksum,
            'urgptr': tcp.urgptr,
            'options': str(tcp.options) if tcp.options else None
        }
        
        session.run(
            """
            MATCH (p:Packet {id: $packet_id})
            MERGE (sport:Port {number: $sport, protocol: 'TCP'})
            MERGE (dport:Port {number: $dport, protocol: 'TCP'})
            CREATE (p)-[:HAS_TCP_LAYER $props]->(tcp:TCPLayer)
            CREATE (tcp)-[:SOURCE_PORT]->(sport)
            CREATE (tcp)-[:DESTINATION_PORT]->(dport)
            """,
            packet_id=packet_id,
            sport=tcp_features['sport'],
            dport=tcp_features['dport'],
            props=tcp_features
        )
    
    def _process_udp(self, session, packet, packet_id: str):
        """Process UDP layer."""
        udp = packet[UDP]
        
        udp_features = {
            'sport': udp.sport,
            'dport': udp.dport,
            'length': udp.len,
            'chksum': udp.chksum
        }
        
        session.run(
            """
            MATCH (p:Packet {id: $packet_id})
            MERGE (sport:Port {number: $sport, protocol: 'UDP'})
            MERGE (dport:Port {number: $dport, protocol: 'UDP'})
            CREATE (p)-[:HAS_UDP_LAYER $props]->(udp:UDPLayer)
            CREATE (udp)-[:SOURCE_PORT]->(sport)
            CREATE (udp)-[:DESTINATION_PORT]->(dport)
            """,
            packet_id=packet_id,
            sport=udp_features['sport'],
            dport=udp_features['dport'],
            props=udp_features
        )
    
    def _process_icmp(self, session, packet, packet_id: str):
        """Process ICMP layer."""
        icmp = packet[ICMP]
        
        icmp_features = {
            'type': icmp.type,
            'type_name': self._get_icmp_type_name(icmp.type),
            'code': icmp.code,
            'chksum': icmp.chksum,
            'id': icmp.id if hasattr(icmp, 'id') else None,
            'seq': icmp.seq if hasattr(icmp, 'seq') else None
        }
        
        session.run(
            """
            MATCH (p:Packet {id: $packet_id})
            CREATE (p)-[:HAS_ICMP_LAYER $props]->(icmp:ICMPLayer)
            """,
            packet_id=packet_id,
            props=icmp_features
        )
    
    def _process_arp(self, session, packet, packet_id: str):
        """Process ARP layer."""
        arp = packet[ARP]
        
        arp_features = {
            'hwtype': arp.hwtype,
            'ptype': arp.ptype,
            'hwlen': arp.hwlen,
            'plen': arp.plen,
            'op': arp.op,
            'op_name': 'request' if arp.op == 1 else 'reply' if arp.op == 2 else 'unknown',
            'hwsrc': arp.hwsrc,
            'psrc': arp.psrc,
            'hwdst': arp.hwdst,
            'pdst': arp.pdst
        }
        
        session.run(
            """
            MATCH (p:Packet {id: $packet_id})
            MERGE (src_ip:IPAddress {address: $psrc})
            MERGE (dst_ip:IPAddress {address: $pdst})
            MERGE (src_mac:MACAddress {address: $hwsrc})
            MERGE (dst_mac:MACAddress {address: $hwdst})
            CREATE (p)-[:HAS_ARP_LAYER $props]->(arp:ARPLayer)
            CREATE (arp)-[:ARP_SOURCE_IP]->(src_ip)
            CREATE (arp)-[:ARP_TARGET_IP]->(dst_ip)
            CREATE (arp)-[:ARP_SOURCE_MAC]->(src_mac)
            CREATE (arp)-[:ARP_TARGET_MAC]->(dst_mac)
            CREATE (src_ip)-[:MAPS_TO]->(src_mac)
            """,
            packet_id=packet_id,
            psrc=arp_features['psrc'],
            pdst=arp_features['pdst'],
            hwsrc=arp_features['hwsrc'],
            hwdst=arp_features['hwdst'],
            props=arp_features
        )
    
    def _process_dns(self, session, packet, packet_id: str):
        """Process DNS layer with queries and answers."""
        dns = packet[DNS]
        
        dns_features = {
            'id': dns.id,
            'qr': dns.qr,
            'opcode': dns.opcode,
            'aa': dns.aa,
            'tc': dns.tc,
            'rd': dns.rd,
            'ra': dns.ra,
            'rcode': dns.rcode,
            'qdcount': dns.qdcount,
            'ancount': dns.ancount,
            'nscount': dns.nscount,
            'arcount': dns.arcount
        }
        
        # Extract queries
        queries = []
        if dns.qd:
            for i in range(dns.qdcount):
                try:
                    qname = dns.qd[i].qname.decode() if isinstance(dns.qd[i].qname, bytes) else str(dns.qd[i].qname)
                    queries.append({
                        'qname': qname,
                        'qtype': dns.qd[i].qtype,
                        'qclass': dns.qd[i].qclass
                    })
                except:
                    pass
        
        # Extract answers
        answers = []
        if dns.an:
            for i in range(dns.ancount):
                try:
                    rdata = str(dns.an[i].rdata)
                    answers.append({
                        'rrname': str(dns.an[i].rrname),
                        'type': dns.an[i].type,
                        'rdata': rdata,
                        'ttl': dns.an[i].ttl
                    })
                except:
                    pass
        
        session.run(
            """
            MATCH (p:Packet {id: $packet_id})
            CREATE (p)-[:HAS_DNS_LAYER $props]->(dns:DNSLayer)
            """,
            packet_id=packet_id,
            props={**dns_features, 'queries': queries, 'answers': answers}
        )
        
        # Create DNS query nodes
        for query in queries:
            session.run(
                """
                MATCH (p:Packet {id: $packet_id})-[:HAS_DNS_LAYER]->(dns:DNSLayer)
                MERGE (domain:Domain {name: $qname})
                CREATE (dns)-[:QUERIES $query_props]->(domain)
                """,
                packet_id=packet_id,
                qname=query['qname'],
                query_props=query
            )
    
    def _process_payload(self, session, packet, packet_id: str):
        """Process raw payload data."""
        raw = packet[Raw]
        payload = raw.load
        
        payload_features = {
            'length': len(payload),
            'entropy': self._calculate_entropy(payload),
            'printable_ratio': self._calculate_printable_ratio(payload),
            'preview': payload[:100].hex()  # First 100 bytes as hex
        }
        
        session.run(
            """
            MATCH (p:Packet {id: $packet_id})
            CREATE (p)-[:HAS_PAYLOAD $props]->(payload:Payload)
            """,
            packet_id=packet_id,
            props=payload_features
        )
    

    def _calculate_entropy(self, data: bytes) -> float:
        """Calculate Shannon entropy of data."""
        if not data:
            return 0.0
        
        import math
        entropy = 0.0
        for x in range(256):
            p_x = float(data.count(bytes([x]))) / len(data)
            if p_x > 0:
                entropy += - p_x * math.log2(p_x)
        return entropy
    
    def _calculate_printable_ratio(self, data: bytes) -> float:
        """Calculate ratio of printable characters in data."""
        if not data:
            return 0.0
        printable = sum(1 for b in data if 32 <= b <= 126)
        return printable / len(data)
    
    @staticmethod
    def _get_ether_type_name(etype: int) -> str:
        """Get Ethernet type name."""
        types = {
            0x0800: 'IPv4',
            0x0806: 'ARP',
            0x86DD: 'IPv6',
            0x8100: 'VLAN'
        }
        return types.get(etype, f'Unknown(0x{etype:04x})')
    
    @staticmethod
    def _get_ip_protocol_name(proto: int) -> str:
        """Get IP protocol name."""
        protocols = {
            1: 'ICMP',
            6: 'TCP',
            17: 'UDP',
            41: 'IPv6',
            47: 'GRE',
            50: 'ESP',
            51: 'AH'
        }
        return protocols.get(proto, f'Unknown({proto})')
    
    @staticmethod
    def _get_icmp_type_name(itype: int) -> str:
        """Get ICMP type name."""
        types = {
            0: 'Echo Reply',
            3: 'Destination Unreachable',
            8: 'Echo Request',
            11: 'Time Exceeded'
        }
        return types.get(itype, f'Unknown({itype})')
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about the knowledge graph."""
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (p:Packet)
                OPTIONAL MATCH (ip:IPAddress)
                OPTIONAL MATCH (port:Port)
                OPTIONAL MATCH (mac:MACAddress)
                OPTIONAL MATCH (domain:Domain)
                RETURN 
                    count(DISTINCT p) as packets,
                    count(DISTINCT ip) as ip_addresses,
                    count(DISTINCT port) as ports,
                    count(DISTINCT mac) as mac_addresses,
                    count(DISTINCT domain) as domains
                """
            )
            return dict(result.single())


# Example usage
if __name__ == "__main__":
    # Initialize the transformer
    transformer = PCAPToNeo4jKG(
        uri="neo4j://127.0.0.1:7687",
        user="neo4j",
        password="battwin1234*",
        database="pcap"
    )
    
    try:
        # Process PCAP file
        transformer.process_pcap("data/pcap/DoS.pcap")
        
        # Get statistics
        stats = transformer.get_statistics()
        print("\nKnowledge Graph Statistics:")
        print(json.dumps(stats, indent=2))
        
    finally:
        transformer.close()