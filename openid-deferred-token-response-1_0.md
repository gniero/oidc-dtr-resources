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
The Deferred Token Response (DTR) flow enables an OpenID Provider to defer the authentication of an End-User for an arbitrarily long time.
The Deferred Token Response Flow consists of the following steps:

1. The Relying Party (RP) sends a request to the OpenID Provider (OP).
2. The OP initiates an Authentication Process and collects authorization and Identity Information from the End-User.
3. The OP responds to the RP with a code identifying that Authentication Process.
4. The RP exchanges the code for a long-lived Access Token and optionally an interim ID Token at the OP.
5. The RP polls the Token Endpoint to eventually receive an ID Token, Access Token, and optionally Refresh Token.
6. The OP eventually completes the Authentication Process.
7. The OP optionally sends a Ping to the RP when the Authentication Process has completed.

These steps are illustrated in the following diagram:
```
+----+                                +----+                  +------+
|    |                                |    |                  |      |
|    |---(1) AuthN Request----------->|    |                  |      |
|    |                                |    |                  | End- |
|    |                                |    |<-(2) Start Auth->| User |
|    |                                |    |                  |      |
|    |<--(3) Auth Code----------------|    |                  |      |
|    |                                |    |                  +------+
|    |---(4a) Initial Token Request-->|    |
|    |                                |    |
|    |<--(4b) Initial Token Response--|    |
|    |                                |    |
|    |                                |    |---------+
|    |                                |    |         |
| RP |---(5a) Poll Request----------->| OP |         |
|    |                                |    | (6) Complete AuthN process
|    |<--(5b) Poll Response-----------|    |         |
|    |                                |    |         |
|    |               ...              |    |<--------+
|    |                                |    |
|    |<--(7) Optional Ping------------|    |
|    |                                |    |
|    |---(5a) Poll Request----------->|    |
|    |                                |    |
|    |<--(5b) Poll Response ----------|    |
|    |                                |    |
+----+                                +----+
```

# Registration and Discovery Metadata

This will define any parameters needed for registration and discovery of the DTR flow features.

## Authorization Server Metadata
Response type:
: A `deferred_code` response type is introduced by this specification in order to indicate to the OP that a deferred authentication response is acceptable once the user interaction ends.

Grant type: 
: This specification introduces the Deferred grant type (an extension grant type as defined by [@!RFC6749, section 4.5]) with the value: `urn:openid:params:grant-type:deferred`

The OP's discovery metadata MUST indicate those values in `response_types_supported` and `grant_types_supported` respectively.

## Client Registration Metadata

Since the Deferred Token Response introduces a way to asynchronously notify the Client of an Authorization decision that could not be instantly made during User interaction, it is necessary for the Client to obtain this response somehow.

The [@?OpenID.CIBA] introduces callback modes for the Authorization Server to inform the Client that an Authorization decision has been made, either by pushing the response directly, or notifying that a decision is available to be queried. Although some parameters work similarly, introducing them separately allows for an RP that supports both specs to handle responses on endpoints at their discretion and avoid future conflicts.


`deferred_client_notification_endpoint`:
: REQUIRED if the RP desires to be notified when the Authentication decision has been taken. It MUST be an HTTPS URL.


# Authentication using Deferred Token Flow

This section describes how to perform authentication using the Deferred Token Flow.

## Authentication Request {#authentication-request}

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

## Authentication Request Acknowledgment

If the {#authentication-request} is successfully validated in accordance with {#authentication-request-validation}, the OpenID Provider (OP) returns a response to the Relying Party indicating that the request has been accepted and any required user interaction has been completed.

Note that this response does not constitute a final Authentication Response, but rather serves as an indication that processing is underway.

The following is a non-normative example of an authentication request acknowledgment:

```
  HTTP/1.1 302 Found
  Location: https://client.example.org/cb?
    deferred_code=SplxlOBeZQQYbYS6WxSbIA
    &state=af0ifjsldkj
```

## Authentication Request Acknowledgment Validation

This will define the logic that RPs should apply to validate Authentication Request Acknowledgment responses.

# Exchanging the Deferred Code to obtain Deferred Authentication ID

The RP sends a Token Request to the Token Endpoint, as described in [@!RFC6749, section 3.2], to obtain  Token Responses. It is RECOMMENDED that all interactions with the OP are secured with DPoP.

The Deferred Authentication ID is assigned by the OP to each Authentication Process in order to allow the RP to poll for the result of that process. This mechanism is similar to the `auth_req_id` defined in [@!OpenID.CIBA]. 

The `deferred_code` value is not used for polling, allowing the OP to apply the same security considerations as it does for authorization codes as specified in [@!RFC6819, section 4.4.1] and [@!RFC9700].

## Deferred Code Exchange Request

The Initial Token Request exchanges the deferred code obtained in the Authentication Request Acknowledgment.

Supported extension parameters from the OAuth 2.0 Token Request MAY be included in this request.

The following is a non-normative example of an initial token request:

```
  POST /token HTTP/1.1
  Host: server.example.com
  Content-Type: application/x-www-form-urlencoded
  Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

  grant_type=urn:openid:params:grant-type:deferred&deferred_code=SplxlOBeZQQYbYS6WxSbIA
    &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
```

## Deferred Code Exchange Request Validation

The OP Provider MUST validate the request received as follows:

1. Authenticate the Client in accordance with Section 9 of [@!OpenID.Core].
2. Ensure the Deferred Code was issued to the authenticated Client.
3. Verify that the Deferred Code is valid and has not been previously used.

## Successful Deferred Code Exchange Response

This will define the response that the RP will receive from the OP when the Initial Token Request was successful.

It MAY include an interim ID Token containing unverified claims (at the discretion of the OP).

The following is a non-normative example of a successful initial token response:

```
  HTTP/1.1 200 OK
  Content-Type: application/json
  Cache-Control: no-store

  {
   "deferred_auth_id": "f4oirNBUlM",
   "expires_in": 10800
   "interval": 60,
   "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3MTdmMzAzYTI3NjVlOGFjYmY0MTEwMGFhOGE0NjllIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vc2VydmVyLmV4YW1wbGUuY29tIiwic3ViIjoiMjQ4Mjg5NzYxMDAxIiwiZW1haWwiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJhdWQiOiJzNkJoZFJrcXQzIiwibm9uY2UiOiJuLTBTNl9XekEyTWoiLCJleHAiOjE3NjIxOTE2ODgsImlhdCI6MTc2MjE5MTk4OH0.TmW5LZmr5tM_gDbk6Tc7VAMw6zYv9eo1BqbKf19rhw8cHsPLLMA25YilywdA66KO2ESWvY3S5YJn3Azypri5jQOeQTmPQZAeXHjcVSBeABzAQz3eGIdtAaDLQ5p0DafdxgEDOrcLLK8yk3X16aBGpJegdBY1HfqAhuYPV2D_LUCeGbJxn0-4nLF9_U7Ws3c4o_3nq9ZNTVEAoJJckRYhXM6pPf2-1tZvRZD2P9B0vPSiJwqN2JFOBoDROwhxPJU4MKWQ3mp5pdGTZqlUL7wn0a2dG-EI1eq6oQrGwINqTHiqZbttCuz1wQtezRxHYITEAoVaI2c3zad0ZSzTbAGNkw"
  }
```

## Deferred Code Exchange Response Validation

This will define the logic that the RP should use to validate the Initial Token Response.

# OpenID Provider Authenticates End-User

This will describe the OP validating the Identity Information from the End-User.
How that works is beyond the scope of this specification.

# Deferred Notification Endpoint

This will define the endpoint that the OP should optionally send a Ping to.
This will be configured in client registration metadata and should only be used if configured.

# Getting the Authentication Result

This will define the steps for the RP to get the result of the Authentication Process.
This process polls a special endpoint for that purpose.

## Token Request using the Authentication Request ID

This will define the Token Request that the RP polls the OP with.
This request MUST use the DPoP-secured Access Token.

The following is a non-normative example of a deferred token request:

```
  POST /token HTTP/1.1
  Host: server.example.com
  Content-Type: application/x-www-form-urlencoded
  Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

  grant_type=urn:openid:params:grant-type:deferred&deferred_auth_id=f4oirNBUlM
```

## Token Request Validation

This will define the validation steps that the OP must perform in order to produce a successful token response or a Token request Error Response

## Successful Token Response

This will define the Token Response that the OP responds to the RP's poll with when the Authentication Process has finished successfully.

The following is a non-normative example of a successful token response:

```
  HTTP/1.1 200 OK
  Content-Type: application/json
  Cache-Control: no-store

  {
   "access_token": "SlAV32hkKG",
   "token_type": "Bearer",
   "expires_in": 3600,
   "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3MTdmMzAzYTI3NjVlOGFjYmY0MTEwMGFhOGE0NjllIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vc2VydmVyLmV4YW1wbGUuY29tIiwic3ViIjoiMjQ4Mjg5NzYxMDAxIiwiZW1haWwiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1ZCI6InM2QmhkUmtxdDMiLCJuYW1lIjoiSm9obkRvZSIsIm5vbmNlIjoibi0wUzZfV3pBMk1qIiwiZXhwIjoxNzYyMTkyNTg4LCJpYXQiOjE3NjIxOTI5ODh9.V0hhdCBkb2VzIG15IHNob2VsIHNheT8gWW91IHNob3VsZCBub3Qgc2hvdw",
   "refresh_token": "8xLOxBtZp8"
  }
```

## Ping Callback

This will define the optional Ping Callback that the RP may request the OP to send it once the Authentication Process has finished.

The following is a non-normative example of a Ping callback sent as an HTTP POST request to the Client's Notification Endpoint (with line wraps within values for display purposes only).

```
    POST /cb HTTP/1.1
    Host: client.example.com
    Authorization: Bearer 8d67dc78-7faa-4d41-aabd-67707b374255
    Content-Type: application/json

    {
     "deferred_auth_id": "f4oirNBUlM"
    }
```
# Token Request Error Response

This will define the Token Error Response that the OP responds to the RP's poll with when the Authentication Process has finished with an error.
This will usually be because the End-User could not be authenticated based on the provided Identity Information.

# Deferred Code Exchange Error Response

This will define the Initial Token Error Response that the OP responds to the RP's Initial Token Request with when the Initial Token Request could not be validated.
This will usually be because the Initial Token Request Validation failed, which will usually happen if the deferred code is expired, the DPoP proof is wrong, or the DPoP headers are missing.

# Authentication Request Error Response

This will define the Authentication Request Error Response that the OP responds to the RP's Authentication Request with when the Authentication Request could not be started.
This will usually be because the Authentication Request Validation failed, because the End-User did not authorize the request, or because the End-User did not provide acceptable Identity Information to the OP.

# Implementation Considerations

## Multi-valued Response Type Authentication Request

The OP MAY accept Authentication Requests providing the response type value as `deferred_code code`. In those cases, it means for the OP that it MAY chose, by its own means, when the Authentication response will be of deferred type or any other provided alternative. 

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