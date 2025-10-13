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
This specification uses the terms "Access Token", "Authorization Endpoint", "Authorization Request", "Authorization Response", "Authorization Code Grant", "Authorization Server", "Client", "Client Authentication", "Client Identifier", "Token Endpoint", "Token Request" and "Token Response" defined by OAuth 2.0 [@!RFC6749], the terms "End-User" and "Request Object" as defined by OpenID Connect Core [@!OpenID.Core] and the term "JSON Web Token (JWT)" defined by JSON Web Token (JWT) [@!RFC7519].

# Overview

# Registration and Discovery Metadata

This will define any parameters needed for registration and discovery of the DTR flow features.

# Authentication Request

This will define the parameters for a DTR Authentication Request.

## Authentication Request Validation

This will define the logic that OPs should apply to validate Authentication Requests.

## OpenID Provider Obtains End-User Authorization and Identity Information

This will describe the OP obtaining authorization and Identity Information from the End-User.
Most of that is beyond the scope of this specification.

## Successful Authentication Request Acknowledgment

This will define the response that the OP will send to the RP after starting an Authentication Process.

## Authentication Request Acknowledgment Validation

This will define the logic that RPs should apply to validate Authentication Request Acknowledgment responses.

# OpenID Providers Authenticates End-User

This will describe the OP validating the Identity Information from the End-User.
How that works is beyond the scope of this specification.

# Getting the Authentication Result

This will define the steps for the RP to get the result of the Authentication Process.

## Token Request Using DTR Grant Type

This will define the Token Request that the RP polls the OP with.

### Successful Token Response

This will define the Token Response that the OP responds to the RP's poll with when the Authentication Process has finished successfully.

## Ping Callback

This will define the optional Ping Callback that the RP may request the OP to send it once the Authentication Process has finished.

# Token Error Response

This will define the Token Error Response that the OP responds to the RP's poll with when the Authentication Process has finished with an error.
This will usually be because the End-User could not be authenticated based on the provided Identity Information.

# Authentication Request Error Response

This will define the Authentication Request Error Response that the OP responds to the RP's Authentication Request with when the Authentication Request could not be started.
This will usually be because the Authentication Request Validation failed, because the End-User did not authorize the request, or because the End-User did not provide acceptable Identity Information to the OP.

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

# Acknowledgments

*To be completed.*

# Notices

*To be completed.*

# Document History

[[ To be removed from the final specification ]]

- 00
    Initial draft.