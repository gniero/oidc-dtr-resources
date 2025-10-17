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

# Registration and Discovery Metadata

This will define any parameters needed for registration and discovery of the DTR flow features.

## Authorization Server Metadata
Response type:
: A `deferred` response type is introduced by this specification in order to indicate to the OP that a deferred authentication response is desired once the user interaction ends. Value MUST be provided in the response type attribute, and MUST NOT be used in conjunction with any other value.

Grant type: 
: This specification introduces the Deferred grant type (an extension grant type as defined by [@!RFC6749, section 4.5]) with the value: `urn:openid:params:grant-type:deferred`

The OP's discovery metadata MUST indicate those values in `response_types_supported` and `grant_types_supported` respectively.

## Client Registration Metadata

Since the Deferred Token Response introduces a way to asynchronously notify the Client of an Authorization decision that could not be instantly made during User interaction, it is necessary for the Client to obtain this response somehow.

The [@?OpenID.CIBA] introduces callback modes for the Authorization Server to inform the Client that an Authorization decision has been made, either by pushing the response directly, or notifying that a decision is available to be queried. Although some parameters works similarly, introducing them separately allows for an RP that supports both specs to handle responses on endpoints at their discretion and avoid future conflicts.


deferred_client_notification_endpoint:
: REQUIRED if the RP desires to be notified upon the Authentication decision has been taken. It MUST be an HTTPS URL.


# Authentication Request {#authentication-request}

Deferred Token Response introduces a new Authentication Request using the OAuth 2.0 Authorization Request. This request is based on the Authentication request of the Authorization Code Flow introduced in Section 3.1.2.1 of [@!OpenID.Core] with the exception of following parameter:

response_type:
: REQUIRED. Deferred Token Response value that determines the authorization processing flow to be used, including what parameters are returned from the endpoints used. This value MUST be `deferred_code`

Relying Parties MAY present additional parameters in this request regarding to OAuth 2.0 extensions (such as Rich Authorization Requests).
Authorization Servers MUST accept those parameters and process them accordingly.

The following is a non-normative example request that would be sent by the User Agent to the Authorization Server in response to a corresponding HTTP 302 redirect response by the Client (with line wraps within values for display purposes only):

```
  GET /authorize?
    response_type=deferred_code
    &client_id=s6BhdRkqt3
    &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
    &scope=openid%20profile%20email
    &nonce=n-0S6_WzA2Mj
    &state=af0ifjsldkj HTTP/1.1
  Host: server.example.com
```

## Authentication Request Validation {#authentication-request-validation}

This will define the logic that OPs should apply to validate Authentication Requests.

## OpenID Provider Obtains End-User Authorization and Identity Information

This will describe the OP obtaining authorization and Identity Information from the End-User.
Most of that is beyond the scope of this specification.

## Successful Authentication Request Acknowledgment

If the {#authentication-request} is successfully validated in accordance with {#authentication-request-validation}, the OpenID Provider (OP) returns a response to the Relying Party indicating that the request has been accepted and any required user interaction has been completed.

Note that this response does not constitute a final Authentication Response, but rather serves as an indication that processing is underway.

The following is a non-normative example of an authentication request acknowledgement:

```
  HTTP/1.1 302 Found
  Location: https://client.example.org/cb?
    deferred_code=SplxlOBeZQQYbYS6WxSbIA
    &state=af0ifjsldkj
```

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
<reference anchor="OpenID.CIBA" target="https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html">
  <front>
    <title>OpenID Connect Client-Initiated Backchannel Authentication Flow - Core 1.0</title>
    <author fullname="Gonzalo Fernandez Rodriguez" initials="G." surname="Fernandez">
      <organization abbrev="Telefonica">Telefonica</organization>
    </author>
    <author fullname="Florian Walter" initials="F." surname="Walter">
      <organization abbrev="Deutsche Telekom AG">Deutsche Telekom AG</organization>
    </author>
    <author fullname="Axel Nennker" initials="A." surname="Nennker">
      <organization abbrev="Deutsche Telekom AG">Deutsche Telekom AG</organization>
    </author>
    <author fullname="Dave Tonge" initials="D." surname="Tonge">
      <organization abbrev="Moneyhub">Moneyhub</organization>
    </author>
    <author fullname="Brian Campbell" initials="B." surname="Campbell">
      <organization abbrev="Ping Identity">Ping Identity</organization>
    </author>
    <date day="1" month="September" year="2021"/>
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