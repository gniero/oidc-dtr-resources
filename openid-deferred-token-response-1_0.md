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
organization="Idura"
    [author.address]
    email = "frederik.krogsdal@idura.eu"

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

OPs capable of handling the Deferred Token Response Flows MUST advertise support for it in its OAuth 2.0 Authorization Server Metadata [@!RFC8414] as follows:

`response_types_supported`:
: A `deferred_code` response type is introduced by this specification in order to indicate to the OP that a deferred authentication response is acceptable once the user interaction ends.

`grant_types_supported`: 
: This specification introduces the Deferred grant type (an extension grant type as defined by [@!RFC6749, section 4.5]) with the value: `urn:openid:params:grant-type:deferred`

## Client Registration Metadata

Since the Deferred Token Response introduces a way to asynchronously notify the Client of an Authorization decision that could not be instantly made during User interaction, it is necessary for the Client to obtain this response somehow.

The [@?OpenID.CIBA] introduces callback modes for the Authorization Server to inform the Client that an Authorization decision has been made, either by pushing the response directly, or notifying that a decision is available to be queried. Although some parameters work similarly, introducing them separately allows for an RP that supports both specs to handle responses on endpoints at their discretion and avoid future conflicts.


`deferred_client_notification_endpoint`:
: REQUIRED if the RP desires to be notified when the Authentication decision has been taken. It MUST be an HTTPS URL.


# Authentication using Deferred Token Flow

This section describes how to perform authentication using the Deferred Token Flow.

## Deferred Code Response Type

This section registers a new Response Type, the `deferred_code`, in accordance with the stipulations in [@!RFC6749, section 8.4].
It also defines combinations of the `deferred_code` Response Type with other Response Types.
The intended purpose of the `deferred_code` is that the response MUST contain a Deferred Authorization Code which can be used at the Token Endpoint.

`deferred_code`
: When supplied as the `response_type` parameter in an OAuth 2.0 Authorization Request, a successful response MUST include the parameter `deferred_code`. The Authorization Server SHOULD NOT return an OAuth 2.0 Authorization Code, Access Token, or Access Token Type in a successful response to the grant request. If a `redirect_uri` is supplied, the User Agent SHOULD be redirected there after granting or denying access. The request MAY include a `state` parameter, and if so, the Authorization Server MUST echo its value as a response parameter when issuing either a successful response or an error response.

`deferred_code code`
: When supplied as the `response_type` parameter in an OAuth 2.0 Authorization Request, a successful response MUST include either the parameter `deferred_code` or the parameter `code`. The Authorization Server SHOULD NOT return an OAuth 2.0 Access Token, or Access Token Type in a successful response to the grant request. If a `redirect_uri` is supplied, the User Agent SHOULD be redirected there after granting or denying access. The request MAY include a `state` parameter, and if so, the Authorization Server MUST echo its value as a response parameter when issuing either a successful response or an error response.

## Authentication Request {#authentication-request}

Deferred Token Response introduces a new Authentication Request using the OAuth 2.0 Authorization Request. This request is based on the Authentication request of the Authorization Code Flow introduced in Section 3.1.2.1 of [@!OpenID.Core] with the exception of following parameter:

`response_type`:
: REQUIRED. Deferred Token Response value that determines the authorization processing flow to be used, including what parameters are returned from the endpoints used. This value MUST be either `deferred_code` or `deferred_code code`.

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

The OpenID Provider MUST validate the request received as follows:

1. Verify that the `response_type` parameter is present and has a value of either `deferred_code` or `deferred_code code`.
2. Check if the Client is registered to use the Deferred Token Response flow.
3. Validate the remaining Authentication Request parameters in accordance with Section 3.1.2.2 - Authentication Request Validation of [@!OpenID.Core].

If any OAuth 2.0 extensions are present in the request, the OP MUST validate them accordingly.

If the OpenID Provider encounters any error, it MUST return an error response, per (#authentication-request-error-response).

## OpenID Provider Obtains End-User Authorization and Identity Information {#op-obtains-end-user-authorization-and-identity-information}

Upon receiving a valid Authentication Request, the OpenID Provider (OP) determines whether End-User interaction is required to complete the authentication process. It MAY present OP-controlled interfaces through the User Agent to collect any required Identity Information from the End-User and obtain explicit authorization.

The OP MAY prompt the End-User to provide credentials, perform multi-factor authentication, or supply additional Identity Information (such as biometric data, government-issued documents, or other forms of verification).

The nature and extent of the Identity Information collected are determined by the OP's policies and the authentication requirements of the Relying Party (RP).

If no interaction is required, or the End-User successfully completes the required interaction, the OP continues processing the Authentication Request. If the End-User declines or fails to provide sufficient information, the OP MUST return an error response as defined in (#authentication-request-error-response).

## Authentication Request Acknowledgment

If the Authentication Request is successfully processed in accordance with (#op-obtains-end-user-authorization-and-identity-information), the OpenID Provider (OP) returns a response to the Relying Party indicating that the request has been accepted and any required user interaction has been completed.

If the `response_type` requested by the Relying Party was `deferred_code code`, the OpenID Provider MAY respond with a Successful Authentication Response as defined in Section 3.1.2.5 of [@!OpenID.Core] to indicate that the user was authenticated immediately.
The remainder of the Authentication then proceeds as an Authorization Code Flow as defined in Section 3.1 of [@!OpenID.Core].

Otherwise, the response MUST contain the parameter `deferred_code`.
Note that a response containing the `deferred_code` parameter does not constitute a final Authentication Response, but rather serves as an indication that processing is underway.

The following is a non-normative example of an Authentication Request Acknowledgment:

```
HTTP/1.1 302 Found
Location: https://client.example.org/cb?
  deferred_code=SplxlOBeZQQYbYS6WxSbIA
  &state=af0ifjsldkj
```

## Authentication Request Acknowledgment Validation

This will define the logic that RPs should apply to validate Authentication Request Acknowledgment responses.

# Exchanging the Deferred Code to obtain Deferred Authentication ID

The Relying Party (RP) sends a Request to the Token Endpoint, as specified in [@!RFC6749, section 3.2], to exchange the deferred code. Upon successful processing of this request, the OpenID Provider (OP) assigns a Deferred Authentication ID to each Authentication Process. This identifier enables the RP to poll for the result of the corresponding process, in a manner analogous to the `auth_req_id` defined in [@!OpenID.CIBA].

The `deferred_code` value is not utilized for polling. This allows the OP to apply the same security considerations to the `deferred_code` as are applied to authorization codes, as described in [@!RFC6819, section 4.4.1] and [@!RFC9700].

Interactions involving Public Clients as defined in [@!RFC6749] SHOULD be secured using Demonstration of Proof-of-Possession (DPoP) [@!RFC9449]. In such cases, the public key used for the DPoP proof presented in the Deferred Code Exchange Request MUST be the same for the Token Request. 

## Deferred Code Exchange Request {#deferred-code-exchange-request}

The Initial Token Request exchanges the deferred code obtained in the Authentication Request Acknowledgment.

Supported extension parameters from the OAuth 2.0 Token Request MAY be included in this request.

A DPoP proof MAY be included in this request in order to bind the Deferred Authentication ID to a public key. Its payload MUST contain the `deferred_code` matching the one sent in the Deferred Code parameter. The RP SHOULD ensure that a public key is not reused across different Authentication Processes.

The following is a non-normative example of an initial token request:

```
POST /token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2IiwiandrIjp7Imt0eSI6IkVDIiwieCI6Imw4dEZyaHgtMzR0VjNoUklDUkRZOXpDa0RscEJoRjQyVVFVZldWQVdCRnMiLCJ5IjoiOVZFNGpmX09rX282NHpiVFRsY3VOSmFqSG10NnY5VERWclUwQ2R2R1JEQSIsImNydiI6IlAtMjU2In19.eyJqdGkiOiJBeDBwYjcyazRtZCIsImh0bSI6IlBPU1QiLCJodHUiOiJodHRwczovL3NlcnZlci5leGFtcGxlLmNvbS90b2tlbiIsImlhdCI6MTc2MzcyMzExMn0.uy3IfO-j8Yg4Aux0uGAuh7_m24WDCfWCUacRPWtFHS9J-HWASoiEqBsuxI1LN3V4To4Mn1ZRv0AVBxuOA6km3g
grant_type=urn:openid:params:grant-type:deferred&deferred_code=SplxlOBeZQQYbYS6WxSbIA
  &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
```

## Deferred Code Exchange Request Validation

The OP Provider MUST validate the request received as follows:

1. Authenticate the Client in accordance with Section 9 of [@!OpenID.Core].
2. Ensure the Deferred Code was issued to the authenticated Client.
3. Verify that the Deferred Code is valid and has not been previously used.
4. If a DPoP proof was provided, 
   1. Validate it in accordance with [@!RFC9449, section 4.3].
   2. Check if the DPoP proof payload contains the `deferred_code` matching the one sent in the Deferred Code parameter.

## Successful Deferred Code Exchange Response{#successful-deferred-code-exchange-response}

This will define the response that the RP will receive from the OP when the Initial Token Request was successful.

It MAY include an interim ID Token containing unverified claims (at the discretion of the OP).

The OP MUST bind the public key used in DPoP proofs to `deferred_auth_id` when RP's Client is of type Public Client as defined in [@!RFC6749] and a DPoP proof is presented in the Deferred Code Exchange Request. Further interactions involving a `deferred_auth_id` MUST require a DPoP proof utilizing the same public key. This mechanism is similar to the binding of DPoP proofs to Refresh Tokens as described in [@!RFC9449, section 5].

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

This will define the logic that the RP should use to validate the Deferred Code Exchange Response.
Note to mention the possibility of associating the `deferred_notification_token` with the `deferred_auth_id` for later validation of the Ping Callback.

# OpenID Provider Authenticates End-User

After issuing the `deferred_code` in the Authentication Request Acknowledgment, the OP continues the Authentication Process by validating the Identity Information obtained from the End-User. The OP MAY take an arbitrary amount of time to complete this process.

The specific processing performed by the OP during this step is outside the scope of this specification. For example, the OP might perform manual review, contact the End User, or use other methods to authenticate the End-User based on the provided Identity Information.

While processing the request, the OP MAY allow the RP to cancel the request as described in (#canceling-an-ongoing-authentication-process).

# Deferred Client Notification Endpoint

This will define the endpoint that the OP should optionally send a Ping to.
This will be configured in client registration metadata and should only be used if configured.

# Getting the Authentication Result

This will define the steps for the RP to get the result of the Authentication Process.
This process polls a special endpoint for that purpose.

## Token Request using the Authentication Request ID

This will define the Token Request that the RP polls the OP with.
This request MUST use the DPoP-secured Access Token.

If a DPoP proof was presented by the RP in the Deferred Code Exchange Request, the RP MUST also present a DPoP proof in this request, utilizing the same public key as previously used. The payload of the DPoP proof MUST include the `deferred_auth_id` value that matches the Deferred Authentication ID parameter provided in the request.

The following is a non-normative example of a deferred token request:

```
POST /token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2IiwiandrIjp7Imt0eSI6IkVDIiwieCI6Imw4dEZyaHgtMzR0VjNoUklDUkRZOXpDa0RscEJoRjQyVVFVZldWQVdCRnMiLCJ5IjoiOVZFNGpmX09rX282NHpiVFRsY3VOSmFqSG10NnY5VERWclUwQ2R2R1JEQSIsImNydiI6IlAtMjU2In19.eyJqdGkiOiJwS2piNGFEZjEiLCJodG0iOiJQT1NUIiwiaHR1IjoiaHR0cHM6Ly9zZXJ2ZXIuZXhhbXBsZS5jb20vdG9rZW4iLCJpYXQiOjE3NjM3MjMyMjB9.4dr1uoyy8m1giIcVgfsXmO_WISirgOAJxqJZul58QCu_MdxOBZ76HNO70BNyF8NJdv8HACS54etcvBr6C2iXxg

grant_type=urn:openid:params:grant-type:deferred&deferred_auth_id=f4oirNBUlM
```

## Token Request Validation

The OP MUST validate the request received as follows:

1. Authenticate the Client in accordance with Section 9 of [@!OpenID.Core].
2. Ensure the Deferred Authentication ID was issued to the authenticated Client.
3. If the Client is a Public Client as defined in [@!RFC6749] and a DPoP proof was associated with the Deferred Authentication ID as specified in (#successful-deferred-code-exchange-response):
   1. Ensure that a DPoP proof is present in the request.
   2. Validate that the public key used for the DPoP proof is the same used for the Deferred Token Exchange as defined in(#deferred-code-exchange-request).
4. If a DPoP proof is provided in the request:
   1. Validate the DPoP token in accordance with [@!RFC9449, section 4.3].
   2. Check if the DPoP proof payload contains the `deferred_auth_id` matching the one sent in the Deferred Authentication ID parameter.
5. Verify that the Authentication Process has been completed, has not been canceled and has not reached timeout
6. Ensure that no access token has been previously issued for the Deferred Authentication ID.
   
If the OP encounters any error, it MUST return an error response, per (#token-request-error-response).

## Successful Token Response

This will define the Token Response that the OP responds to the RP's poll with when the Authentication Process has finished successfully.

The following is a non-normative example of a successful token response:

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "access_token": "SlAV32hkKG",
  "token_type": "DPoP",
  "expires_in": 3600,
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3MTdmMzAzYTI3NjVlOGFjYmY0MTEwMGFhOGE0NjllIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vc2VydmVyLmV4YW1wbGUuY29tIiwic3ViIjoiMjQ4Mjg5NzYxMDAxIiwiZW1haWwiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1ZCI6InM2QmhkUmtxdDMiLCJuYW1lIjoiSm9obkRvZSIsIm5vbmNlIjoibi0wUzZfV3pBMk1qIiwiZXhwIjoxNzYyMTkyNTg4LCJpYXQiOjE3NjIxOTI5ODh9.V0hhdCBkb2VzIG15IHNob2VsIHNheT8gWW91IHNob3VsZCBub3Qgc2hvdw",
  "refresh_token": "8xLOxBtZp8"
}
```

## Ping Callback

If the client has registered a `deferred_client_notification_endpoint` during client registration, the OP sends a Ping to that endpoint once the Authentication Process has finished, regardless of the outcome.

Ping callbacks are not sent for timed-out Authentication Processes, since the RP is informed of the expiration time via the `expires_in` parameter in the (#successful-deferred-code-exchange-response).

In this request, the OP sends the `deferred_notification_token` in the `Authorization` header as a Bearer token in order to authenticate the request. The OP MUST ensure that a (#successful-deferred-code-exchange-response) was previously sent to the RP containing the `deferred_auth_id`. RPs MAY associate the `deferred_notification_token` with the `deferred_auth_id` in order to strengthen validation.

The following is a non-normative example of a Ping callback sent as an HTTP POST request to the Deferred Client Notification Endpoint (with line wraps within values for display purposes only).

```
POST /cb HTTP/1.1
Host: client.example.com
Authorization: Bearer 8d67dc78-7faa-4d41-aabd-67707b374255
Content-Type: application/json

{
  "deferred_auth_id": "f4oirNBUlM"
}
```

The Client MUST verify the `deferred_notification_token` to authenticate the request. If the bearer token is invalid, the RP SHOULD respond with an HTTP 401 Unauthorized status code.

For valid requests, the Deferred Client Notification Endpoint SHOULD respond with an HTTP 204 No Content status code. The OP SHOULD also accept responses with HTTP 200 OK, and any body in the response SHOULD be ignored.

The Client MUST NOT return an HTTP 3xx status code. The OP MUST NOT follow redirects.

Handling of HTTP error codes in the 4xx and 5xx ranges by the OP is out of scope for this specification. Administrative action is likely to be required in these cases.

Clients MUST ignore unrecognized request parameters.

# Canceling an Ongoing Authentication Process {#canceling-an-ongoing-authentication-process}

In some scenarios, the RP might want to cancel an ongoing Authentication Process that got deferred before it has completed (e.g. user-initiated cancellation) in order to avoid unnecessary processing for both RP and OP. This specification defines the Cancellation Endpoint that the RP can use to cancel an ongoing Authentication Process. 

Other mechanisms such as a timeout parameter in the authentication request MAY be supported by the OP, but are out of scope for this specification.

The Authentication Cancellation can be achieved by the RP sending a request to the OP as described in the following sections. 

## Authentication Cancellation Request

Once the RP gets possession of the `deferred_code` from the Initial Token Response, it can send an Authentication Cancellation Request to the OP in order to cancel the ongoing Authentication Process.


The following is a non-normative example of an authentication cancellation request:

```
POST /df-authentication/cancel HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

deferred_auth_id=SplxlOBeZQQYbYS6WxSbIA
```

## Authentication Cancellation Request Validation

The OP MUST validate the request received as follows:

1. Authenticate the Client in accordance with Section 9 of [@!OpenID.Core].
2. Ensure the Deferred Authentication was issued to the authenticated Client.
3. Verify that no access token has been issued for the Deferred Authentication.

After successful validation, the OP marks this Authentication Request as cancelled. Any requests to poll for the result of the Authentication Process after the OP accepts the cancellation request MUST be handled as described in (#token-request-error-response). 

Disposal of any collected Identity Information is beyond the scope of this specification.

## Authentication Cancellation Response

The OP responds to the RP's Authentication Cancellation Request with 200 OK status code if the cancellation was successful, or if the RP submitted an invalid or already-processed `deferred_auth_id`.

Since the purpose of this request is to stop the Authentication Process, distinction of the cancellation outcome is not necessary for the RP.
This behavior is similar to [@!RFC7009, section 2.2].

The following is a non-normative example of an authentication cancellation response:

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
```

# Token Request Error Response {#token-request-error-response}

This will define the Token Error Response that the OP responds to the RP's poll with when the Authentication Process has finished with an error.
This will usually be because the End-User could not be authenticated based on the provided Identity Information. Reminder to consider cancellation that has been described earlier in this specification.

# Deferred Code Exchange Error Response

This will define the Initial Token Error Response that the OP responds to the RP's Initial Token Request with when the Initial Token Request could not be validated.
This will usually be because the Initial Token Request Validation failed, which will usually happen if the deferred code is expired, the DPoP proof is wrong, or the DPoP headers are missing.

# Authentication Request Error Response {#authentication-request-error-response}

This will define the Authentication Request Error Response that the OP responds to the RP's Authentication Request with when the Authentication Request could not be started.
This will usually be because the Authentication Request Validation failed, because the End-User did not authorize the request, or because the End-User did not provide acceptable Identity Information to the OP.

# Authentication Cancellation Request Error Response

An Authentication Cancellation Error Response is returned directly from the Cancellation Endpoint in response to the Cancellation Request sent by the RP. The applicable error codes are detailed below (some of which are in conformance with OAuth 2.0 section [@RFC6749, 5.2]).

Authentication Error Responses are sent in the same format as Token Error Responses, i.e. the HTTP response body uses the application/json media type with the following parameters:

`error`:
: REQUIRED. A single ASCII error code from one present in the list below.

`error_description`:
: OPTIONAL. Human-readable ASCII [USASCII] text providing additional information, used to assist the client developer in understanding the error that occurred. Values for the "error_description" parameter MUST NOT include characters outside the set %x20-21 / %x23-5B / %x5D-7E.

`error_uri`:
: OPTIONAL. A URI identifying a human-readable web page with information about the error to provide the client developer with additional information. Values for the "error_uri" parameter MUST conform to the URI-reference syntax and thus MUST NOT include characters outside the set %x21 / %x23-5B / %x5D-7E.

List of authentication error codes associated with HTTP Errors.

HTTP 400 Bad Request

`invalid_request`:
: The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, contains more than one of the hints, or is otherwise malformed.

HTTP 401 Unauthorized

`invalid_client`:
: Client authentication failed (e.g., invalid client credentials, unknown client, no client authentication included, or unsupported authentication method).

# Implementation Considerations

## Multi-valued Response Type Authentication Request

The OP MAY accept Authentication Requests providing the response type value as `deferred_code code`. In those cases, it means for the OP that it MAY chose, by its own means, when the Authentication response will be of deferred type or any other provided alternative. 

# Privacy Considerations

# Security Considerations

In addition to the security considerations described in [@!RFC6749], [@!RFC7519], [@!RFC9449], and [@!OpenID.Core], the following considerations apply to this specification.

## Deferred Notification Token

The `deferred_notification_token` is a bearer token that enables the OP to authenticate to the RP when sending the Ping Callback. Therefore, it is imperative that this token is protected against unauthorized access and disclosure.

This token SHOULD be generated following the least privilege principle, ensuring it can only be used for its intended purpose of authenticating the OP to the RP during the Ping Callback.

Redirection-based flows that include the `deferred_notification_token` in the URL are discouraged, as URLs can be logged or exposed in various ways, potentially leading to token leakage.

RPs MAY consider the adoption of mechanisms such as Pushed Authorization Requests [@!RFC9126] or Encrypted Request Objects defined in Section 6.1 of [@!OpenID.Core] to avoid exposing `deferred_notification_token` in URLs. 

Implementations that opt to use request objects passed by reference SHOULD ensure that the request object is protected against unauthorized access, for example by using short-lived, single-use URIs with adequate entropy, or requiring a form of authentication such as mTLS.

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
