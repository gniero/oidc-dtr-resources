%%%
title = "OpenID Connect Deferred Token Response Flow 1.0 - draft 00"
abbrev = "openid-deferred-token-response"
ipr = "none"
workgroup = "OpenID Connect"
keyword = ["security", "openid", "lifecycle"]

[seriesInfo]
name = "Internet-Draft"
value = "openid-deferred-token-response-1_0"
status = "standard"

[[author]]
initials="F.K."
surname="Jacobsen"
fullname="Frederik Krogsdal Jacobsen"
organization="Criipto"
    [author.address]
    email = "frederik.krogsdal@criipto.com"

[[author]]
initials="G."
surname="de Oliveira Niero"
fullname="Guilherme de Oliveira Niero"
organization="Independent"
    [author.address]
    email = "gniero@gmail.com"

%%%

.# Abstract
Draft of the Deferred Token Response Flow.

{mainmatter}

# Introduction

## Requirements Notation and Conventions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in BCP 14 [@!RFC2119] [@!RFC8174] when, and only when, they appear in all capitals, as shown here.
Throughout this document, values are quoted to indicate that they are to be taken literally.
When using these values in protocol messages, the quotes MUST NOT be used as part of the value.

## Terminology
This specification uses the terms "Access Token", "Authorization Endpoint", "Authorization Request", "Authorization Response", "Authorization Code Grant", "Authorization Server", "Client", "Client Authentication", "Client Identifier", "Token Endpoint", "Token Request" and "Token Response" defined by OAuth 2.0 [@!RFC6749], the terms "OpenID Provider (OP)", "Relying Party (RP)", "End-User" and "Request Object" as defined by OpenID Connect Core [@!OpenID.Core] and the term "JSON Web Token (JWT)" defined by JSON Web Token (JWT) [@!RFC7519].

This specification also defines the following terms:

Authentication Process
: The steps taken by an OpenID Provider to authenticate an End-User. The process MAY depend on Identity Information provided by the End-User. For example, the Authentication Process might involve checking the integrity of the Identity Information. The nature of the Authentication Process is beyond the scope of this specification.

Identity Information
: Information collected from the End-User by the OpenID Provider as input to the Authentication Process. For example, this might be a picture of a driver's license and a video of the End-User performing a series of gestures. The nature of the Identity Information is beyond the scope of this specification.

# Overview
Deferred Token Response (DTR) enables an OpenID Provider to defer the authentication of an End-User for an arbitrarily long time.
The Deferred Token Response Flow consists of the following steps:

1. The Relying Part (RP) sends a request to the OpenID Provider (OP).
1. The OP initiates an Authentication Process and collects authorization and Identity Information from the End-User.
1. The OP responds to the RP with a unique identifier that identifies that Authentication Process.
1. The OP eventually completes the Authentication Process.
1. The RP will poll the Token Endpoint to receive an ID Token, Access Token, and optionally Refresh Token.
1. The OP optionally sends a Ping to the RP when the Authentication Process has completed.

These steps are illustrated in the following diagram:
```
+----+                           +----+                    +------+
|    |                           |    |                    |      |
|    |----(1) AuthN Request----->|    |                    |      |
|    |                           |    |                    | End- |
|    |                           |    |<--(2) Start Auth-->| User |
|    |                           |    |                    |      |
|    |<---(3) Auth Reference-----|    |                    |      |
|    |                           |    |                    +------+
|    |                           |    |---------+                  
|    |                           |    |         |                  
| RP |----(5a) Poll Request----->| OP |         |                  
|    |                           |    | (4) Complete AuthN process 
|    |<---(5b) Poll Response-----|    |         |                  
|    |                           |    |         |                  
|    |            ...            |    |<--------+                  
|    |                           |    |                            
|    |<---(6) Optional Ping------|    |                            
|    |                           |    |                            
|    |----(5a) Poll Request----->|    |                            
|    |                           |    |                            
|    |<---(5b) Poll Response-----|    |                            
|    |                           |    |                            
+----+                           +----+                            
```


# Deferred Token Response Flow

# Implementation Considerations

# Privacy Considerations

# Security Considerations

# IANA Considerations

No new registrations.

{backmatter}

<reference anchor="OpenID.Core" target="https://openid.net/specs/openid-connect-core-1_0.html">
  <front>
    <title>OpenID Connect Core 1.0 incorporating errata set 2</title>
    <author fullname="Nat Sakimura" initials="N." surname="Sakimura">
      <organization abbrev="NAT.Consulting (was at NRI)">NAT.Consulting</organization>
    </author>
    <author fullname="John Bradley" initials="J." surname="Bradley">
      <organization abbrev="Yubico (was at Ping Identity)">Yubico</organization>
    </author>
    <author fullname="Michael B. Jones" initials="M.B." surname="Jones">
      <organization abbrev="Self-Issued Consulting (was at Microsoft)">Self-Issued Consulting</organization>
    </author>
    <author fullname="Breno de Medeiros" initials="B." surname="de Medeiros">
      <organization abbrev="Google">Google</organization>
    </author>
    <author fullname="Chuck Mortimore" initials="C." surname="Mortimore">
      <organization abbrev="Disney (was at Salesforce)">Disney</organization>
    </author>
    <date day="15" month="December" year="2023"/>
  </front>
</reference>

# Use cases

# Acknowledgements

*To be completed.*

# Notices

*To be completed.*

# Document History

[[ To be removed from the final specification ]]

- 00
    Initial draft.