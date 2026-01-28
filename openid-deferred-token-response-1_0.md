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
This specification uses the terms "Access Token", "Authorization Endpoint", "Authorization Request", "Authorization Response", "Authorization Code Grant", "Authorization Server", "Client", "Public Client", "Client Authentication", "Client Identifier", "Token Endpoint", "Token Request" and "Token Response" defined by OAuth 2.0 [@!RFC6749], the terms "OpenID Provider (OP)", "Relying Party (RP)", "End-User" and "Request Object" as defined by OpenID Connect Core [@!OpenID.Core], the term "JSON Web Token (JWT)" defined by JSON Web Token (JWT) [@!RFC7519], and the term "DPoP Proof" defined by OAuth 2.0 Demonstrating Proof of Possession (DPoP) [@!RFC9449].

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

This specification declares parameters for both Authorization Server and Client. Each following section describes them accordingly.

## Authorization Server Metadata

OPs capable of handling the Deferred Token Response Flows MUST advertise support for it in its OAuth 2.0 Authorization Server Metadata [@!RFC8414] as follows:

`response_types_supported`
: A `deferred_code` response type is introduced by this specification in order to indicate to the OP that a deferred authentication response is acceptable once the user interaction ends.

`grant_types_supported`
: This specification introduces the Deferred grant type (an extension grant type as defined by [@!RFC6749, section 4.5]) with the value: `urn:openid:params:grant-type:deferred`

## Client Registration Metadata

The following Client Metadata parameter is defined by this specification to be used during Client Registration as defined in [@!RFC7591]:

`deferred_client_notification_endpoint`
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

Deferred Token Response introduces a new Authentication Request using the OAuth 2.0 Authorization Request.
This request is the same as the Authentication request of the Authorization Code Flow introduced in Section 3.1.2.1 of [@!OpenID.Core] with the exception of the following parameter:

`response_type`
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

Additional Authorization Request parameters regarding to OAuth 2.0 extensions MAY be used. In such cases, they MUST be validated according to their definitions.

If the OpenID Provider encounters any error, it MUST return an error response, per (#authentication-request-error-response).

## OpenID Provider Obtains End-User Authorization and Identity Information {#op-obtains-end-user-authorization-and-identity-information}

Upon receiving a valid Authentication Request, the OpenID Provider (OP) determines whether End-User interaction is required to complete the authentication process. It MAY present OP-controlled interfaces through the User Agent to provide guidance through the Authentication steps.

Through these interfaces, the OP MAY prompt the End-User to provide credentials, perform multi-factor authentication, or supply additional Identity Information (such as biometric data, government-issued documents, or other forms of verification).

The nature and extent of the Identity Information collected are determined by the OP's policies and the authentication requirements of the Relying Party (RP).

If no interaction is required, or the End-User successfully completes the required interaction, the OP continues processing the Authentication Request. If the End-User declines or fails to provide sufficient information, the OP MUST return an error response as defined in (#authentication-request-error-response).

## Authentication Request Acknowledgment {#authentication-request-acknowledgment}

If the Authentication Request is successfully processed in accordance with (#op-obtains-end-user-authorization-and-identity-information), the OpenID Provider (OP) returns a response to the Relying Party indicating that the request has been accepted and any required user interaction has been completed.

If the `response_type` requested by the Relying Party was `deferred_code code`, the OpenID Provider MAY respond with a Successful Authentication Response as defined in Section 3.1.2.5 of [@!OpenID.Core] to indicate that the user was authenticated immediately.
The remainder of the Authentication then proceeds as an Authorization Code Flow as defined in Section 3.1 of [@!OpenID.Core].

Otherwise, the response MUST be an Authentication Request Acknowledgment.
Note that an Authentication Request Acknowledgment does not constitute a final Authentication Response, but rather serves as an indication that further processing is underway.

An Authentication Request Acknowledgment is composed of the following parameters:

`deferred_code`
: REQUIRED. This is a unique identifier for the Authentication Request made by the Client. It MUST contain sufficient entropy (a minimum of 128 bits while 160 bits is RECOMMENDED) to make brute force guessing or forgery of a valid `deferred_code` computationally infeasible. The means of achieving this are implementation-specific, with possible approaches including secure pseudorandom number generation or cryptographically secured self-contained tokens. The OpenID Provider MUST restrict the characters used to 'A'-'Z', 'a'-'z', '0'-'9', '.', '-' and '_', to reduce the chance of the client incorrectly decoding or re-encoding the `deferred_code`; this character set was chosen to allow the server to use unpadded base64url if it wishes. The identifier MUST be treated as opaque by the client.

`state`
: OAuth 2.0 state value. REQUIRED if the Authorization Request included the state parameter. Set to the value received from the Client.

The following is a non-normative example of an Authentication Request Acknowledgment:

```
HTTP/1.1 302 Found
Location: https://client.example.org/cb?
  deferred_code=SplxlOBeZQQYbYS6WxSbIA
  &state=af0ifjsldkj
```

## Authentication Request Acknowledgment Validation

Upon receiving an Authentication Request Acknowledgment, the Relying Party (RP) MUST validate the response as follows:

1. Ensure that the `deferred_code` parameter is present.
2. Verify that a `code` parameter is not present. 
3. If the Client includes a `state` parameter in Authentication Requests, verify that the `state` parameter is present in the response. The Client MAY perform additional validation to match the `state` parameter response with the one present in the Authentication Request.

When the Client requests the `deferred_code code` response type, it MUST distinguish if the response being validated is an [Authentication Request Acknowledgment](#authentication-request-acknowledgment) or a Successful Authentication Response of [@!OpenID.Core]. This can be achieved by checking for the presence of the `deferred_code` parameter. Determining the type of response is crucial for the Client to proceed with the appropriate flow.

Responses containing both `code` and `deferred_code` parameters MUST be considered invalid.

Any unrecognized parameter MUST be ignored by the Client. 

# Exchanging the Deferred Code to obtain Deferred Authentication ID

The Relying Party (RP) sends a Request to the Token Endpoint, as specified in [@!RFC6749, section 3.2], to exchange the `deferred_code`. Upon successful processing of this request, the OpenID Provider (OP) assigns a Deferred Authentication ID to each Authentication Process. This identifier enables the RP to poll for the result of the corresponding process, in a manner analogous to the `auth_req_id` defined in [@!OpenID.CIBA].

The `deferred_code` value is not utilized for polling. This allows the OP to apply the same security considerations to the `deferred_code` as are applied to authorization codes, as described in [@!RFC6819, section 4.4.1] and [@!RFC9700].

Interactions involving Public Clients SHOULD be secured using Demonstration of Proof-of-Possession (DPoP) [@!RFC9449]. In such cases, the public key used for the DPoP proof presented in the Deferred Code Exchange Request MUST be the same for the Token Request. 

## Deferred Code Exchange Request {#deferred-code-exchange-request}

The Deferred Code Exchange Request exchanges the `deferred_code` obtained in the Authentication Request Acknowledgment.

The Client makes an HTTP POST request to the Token Endpoint by sending the following parameters using the `application/x-www-form-urlencoded` format:

`grant_type`
: REQUIRED. Value MUST be `urn:openid:params:grant-type:deferred`.

`deferred_code`
: REQUIRED. The identifier of the Authentication Request, issued by the OP to the Client requesting the exchange.

`deferred_notification_token`
: OPTIONAL. A bearer access token which the OP can use to access the Client's Deferred Notification Endpoint when sending a Ping Callback for this request.

Supported extension parameters from the OAuth 2.0 Token Request MAY be included in this request.

A DPoP proof MAY be included in this request. The RP SHOULD ensure that a public key is not reused across different Authentication Processes.

The following is a non-normative example of a Deferred Code Exchange Request (with line wraps within values for display purposes only):

```
POST /token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2IiwiandrIjp7Imt0eSI6IkVDIiwieCI6Imw4dEZyaHgtMzR0VjNoUklDUkRZOXpDa0RscEJoRjQyVVFVZldWQVdCRnMiLCJ5IjoiOVZFNGpmX09rX282NHpiVFRsY3VOSmFqSG10NnY5VERWclUwQ2R2R1JEQSIsImNydiI6IlAtMjU2In19.eyJqdGkiOiJBeDBwYjcyazRtZCIsImh0bSI6IlBPU1QiLCJodHUiOiJodHRwczovL3NlcnZlci5leGFtcGxlLmNvbS90b2tlbiIsImlhdCI6MTc2MzcyMzExMn0.uy3IfO-j8Yg4Aux0uGAuh7_m24WDCfWCUacRPWtFHS9J-HWASoiEqBsuxI1LN3V4To4Mn1ZRv0AVBxuOA6km3g
grant_type=urn:openid:params:grant-type:deferred&deferred_code=SplxlOBeZQQYbYS6WxSbIA&deferred_notification_token=8d67dc78-7faa-4d41-aabd-67707b374255
```

## Deferred Code Exchange Request Validation

The OP MUST validate the request received as follows:

1. Authenticate the Client in accordance with Section 9 of [@!OpenID.Core].
2. Ensure the Deferred Code was issued to the authenticated Client.
3. Verify that the Deferred Code is valid and has not been previously used.
4. If a DPoP proof was provided, validate it in accordance with [@!RFC9449, section 4.3].

## Successful Deferred Code Exchange Response{#successful-deferred-code-exchange-response}

After receiving and validating an authorized Deferred Code Exchange Request from the Client, the OpenID Provider returns an HTTP 200 OK response to the Client containing the following parameters encoded in `application/json` format:

`deferred_auth_id`
: REQUIRED. The Deferred Authentication ID is a unique identifier for the Authentication Process. The identifier MUST be treated as opaque by the client.

`expires_in`
: OPTIONAL. A JSON number with a positive integer value indicating the expiration time of the `deferred_auth_id` in seconds. Some requests may naturally become irrelevant once some amount of time has passed. The OP MAY indicate that this is the case by returning a value in this parameter. The method of determining this value is outside the scope of this specification. Clients SHOULD support arbitrarily large values for this parameter.

`interval`
: OPTIONAL. A JSON number with a positive integer value indicating the minimum amount of time in seconds that the Client MUST wait between polling requests to the token endpoint. Clients SHOULD support arbitrarily large values for this parameter.

`interim_id_token`
: OPTIONAL. In some cases, the OP can immediately authenticate parts of the Identity Information provided by the End User. In some cases, the Client is interested in the Identity Information provided by the End User even before it is validated by the OP. To support this, the OP MAY include an Interim ID Token containing partially verified claims. The method by which the OP indicates the validation status of each claim is outside the scope of this specification.

Once redeemed for a successful Deferred Code Exchange Response, the `deferred_code` value that was used is no longer valid.

The OP MUST bind the public key used in DPoP proofs to `deferred_auth_id` when the Client is of type Public Client and a DPoP proof is presented in the Deferred Code Exchange Request. Further interactions involving a `deferred_auth_id` MUST require a DPoP proof utilizing the same public key. This mechanism is similar to the binding of DPoP proofs to Refresh Tokens as described in [@!RFC9449, section 5].

Clients MUST ignore unrecognized response parameters.

If the Client sent a `deferred_notification_token` in the Deferred Code Exchange Request, the Client SHOULD bind the received `deferred_auth_id` to the `deferred_notification_token` to prevent mix-up attacks.

The following is a non-normative example of a successful Deferred Code Exchange Response:

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "deferred_auth_id": "f4oirNBUlM",
  "expires_in": 10800
  "interval": 60,
  "interim_id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3MTdmMzAzYTI3NjVlOGFjYmY0MTEwMGFhOGE0NjllIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vc2VydmVyLmV4YW1wbGUuY29tIiwic3ViIjoiMjQ4Mjg5NzYxMDAxIiwiZW1haWwiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJhdWQiOiJzNkJoZFJrcXQzIiwibm9uY2UiOiJuLTBTNl9XekEyTWoiLCJleHAiOjE3NjIxOTE2ODgsImlhdCI6MTc2MjE5MTk4OH0.TmW5LZmr5tM_gDbk6Tc7VAMw6zYv9eo1BqbKf19rhw8cHsPLLMA25YilywdA66KO2ESWvY3S5YJn3Azypri5jQOeQTmPQZAeXHjcVSBeABzAQz3eGIdtAaDLQ5p0DafdxgEDOrcLLK8yk3X16aBGpJegdBY1HfqAhuYPV2D_LUCeGbJxn0-4nLF9_U7Ws3c4o_3nq9ZNTVEAoJJckRYhXM6pPf2-1tZvRZD2P9B0vPSiJwqN2JFOBoDROwhxPJU4MKWQ3mp5pdGTZqlUL7wn0a2dG-EI1eq6oQrGwINqTHiqZbttCuz1wQtezRxHYITEAoVaI2c3zad0ZSzTbAGNkw"
}
```

## Deferred Code Exchange Response Validation

Upon receiving a Successful Deferred Code Exchange Response, the Relying Party (RP) MUST validate the response as follows:

1. Ensure that the `deferred_auth_id` parameter is present.
2. If an `interim_id_token` is present, validate it in accordance with Section 3.1.3.7 of [@!OpenID.Core].
   
The Client MUST retain the `deferred_auth_id` to validate Ping callbacks and to use when making Token or Cancellation requests.

The Client SHOULD store the expiration time in order to clean up authentication requests for which no Ping Callback is received.

# OpenID Provider Authenticates End-User

After issuing the `deferred_code` in the Authentication Request Acknowledgment, the OP continues the Authentication Process by validating the Identity Information obtained from the End-User. The OP MAY take an arbitrary amount of time to complete this process.

The specific processing performed by the OP during this step is outside the scope of this specification. For example, the OP might perform manual review, contact the End User, or use other methods to authenticate the End-User based on the provided Identity Information.

While processing the request, the OP MAY allow the RP to cancel the request as described in (#canceling-an-ongoing-authentication-process).

# Deferred Client Notification Endpoint

Since the Deferred Token Response provides a way to authenticate the End‑User asynchronously after User interaction has ended, the Client needs a mechanism to receive this response.

The simplest approach is for the Client to poll the Token Endpoint. In addition, this specification defines a method for the OP to notify the RP when an Authentication decision has been made by sending a Ping Callback to an RP‑defined endpoint.

This mechanism is RECOMMENDED for both OPs and RPs, as it offers a more efficient way to receive the Authentication decision without relying solely on continuous polling. See (#design-considerations-for-poll-and-ping) for related design considerations.

The Deferred Client Notification Endpoint operates similarly to the callback modes defined in [@?OpenID.CIBA]. Although some parameters behave in comparable ways, they are defined separately to allow an RP supporting both specifications to route and process responses on distinct endpoints, thereby avoiding potential conflicts.

The specific behavior of the Deferred Client Notification Endpoint is described in (#ping-callback).

# Getting the Authentication Result

This will define the steps for the RP to get the result of the Authentication Process.
This process polls a special endpoint for that purpose.

## Token Request using the Authentication Request ID {#token-request-using-the-authentication-request-id}

The Client makes an HTTP POST request to the Token Endpoint by sending the following parameters using the `application/x-www-form-urlencoded` format:

`grant_type`
: REQUIRED. Value MUST be `urn:openid:params:grant-type:deferred`.

`deferred_auth_id`
: REQUIRED. The unique identifier of the Authentication Process, issued by the OP to the Client requesting the token.

The RP MUST present a DPoP proof in this request if the [Deferred Code Exchange Request](#deferred-code-exchange-request) included one. If the RP's Client is a Public Client, the DPoP proof MUST use the same public key used in the Deferred Code Exchange Request. Public keys SHOULD NOT be reused across different Authentication Processes.

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
2. Ensure the given `deferred_auth_id` was issued to the authenticated Client.
3. If a DPoP proof was provided in the [Deferred Code Exchange Request](#deferred-code-exchange-request)
   1. Validate that a DPoP proof is provided in this request.
   2. If the Client is a Public Client, verify that the public key used in this DPoP proof matches the one used in the Deferred Code Exchange Request.
4. If a DPoP proof is provided in this request, validate it in accordance with [@!RFC9449, section 4.3].
5. Verify that the Authentication Process has been completed, has not been canceled and has not reached timeout
6. Verify that no access token has been previously issued for the Deferred Authentication ID.
   
If the OP encounters any error, it MUST return an error response, per (#token-request-error-response).

## Successful Token Response

After receiving and validating an authorized Token Request from the Client, and once the End User associated with the supplied `deferred_auth_id` has been authenticated, the OpenID Provider returns a successful response as defined in Section 3.1.3.3 of [OpenID.Core].
After it has been redeemed for a successful Token response, the used `deferred_auth_id` value becomes invalid.

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

## Ping Callback {#ping-callback}

If the client has registered a `deferred_client_notification_endpoint` during client registration, the OP sends a Ping Callback to that endpoint once the Authentication Process has finished, regardless of the outcome.

The OP MUST ensure that a successful Deferred Code Exchange Response (#successful-deferred-code-exchange-response) containing the `deferred_auth_id` was sent to the RP before sending the Ping Callback.

Ping callbacks are not sent for timed-out Authentication Processes, since the RP is informed of any expiration time via the `expires_in` parameter in the successful Deferred Code Exchange Response (#successful-deferred-code-exchange-response).

The Ping Callback is an HTTP POST request containing the following parameter using the `application/json` format:

`deferred_auth_id`
: REQUIRED: The unique identifier of the finished Authentication Process.

The Client MUST protect the Deferred Client Notification Endpoint from unauthorized access.

If the Client sent a `deferred_notification_token` in the Deferred Code Exchange Request, the OP MUST send the `deferred_notification_token` in the `Authorization` header as a Bearer token in order to authenticate the request.
The Client SHOULD associate the `deferred_notification_token` with the `deferred_auth_id` in order to strengthen validation.

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

The Client MUST verify the `deferred_notification_token` to authenticate the request if it is present.
If the bearer token is invalid, the RP SHOULD respond with an HTTP 401 Unauthorized status code.

For valid requests, the Deferred Client Notification Endpoint SHOULD respond with an HTTP 204 No Content status code.
The OP SHOULD also accept responses with HTTP 200 OK, and any HTTP body in the response SHOULD be ignored.

The Client MUST NOT return an HTTP 3xx status code. The OP MUST NOT follow redirects.

Handling of HTTP error codes in the 4xx and 5xx ranges by the OP is out of scope for this specification. Administrative action is likely to be required in these cases.

Clients MUST ignore unrecognized request parameters.

# Canceling an Ongoing Authentication Process {#canceling-an-ongoing-authentication-process}

In some scenarios, the RP might need to cancel an ongoing Authentication Process that was deferred before completion (e.g. user-initiated cancellation) to avoid unnecessary processing for both the RP and the OP. This specification defines the Cancellation Endpoint that the RP can use to cancel an ongoing Authentication Process.

The Authentication Cancellation can be achieved by the RP sending a request to the OP as described in the following sections. 

## Authentication Cancellation Request {#authentication-cancellation-request}

Once the RP gets possession of the `deferred_auth_id` from the Deferred Code Exchange Response, it can send an Authentication Cancellation Request to the OP in order to cancel the ongoing Authentication Process.

The Client makes an HTTP POST request to the Authentication Cancellation Endpoint by sending the following parameters using the `application/x-www-form-urlencoded` format:

`deferred_auth_id`
: REQUIRED. The unique identifier of the Authentication Process, issued by the OP to the Client requesting the cancellation.

The RP MUST present a DPoP proof in this request if the [Deferred Code Exchange Request](#deferred-code-exchange-request) included one. If the RP's Client is a Public Client, the DPoP proof MUST use the same public key used in the Deferred Code Exchange Request. Public keys SHOULD NOT be reused across different Authentication Processes.

The following is a non-normative example of an authentication cancellation request:

```
POST /df-authentication/cancel HTTP/1.1
Host: server.example.com
Content-Type: application/json
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IlJTMjU2IiwiandrIjp7Imt0eSI6IkVDIiwieCI6Imw4dEZyaHgtMzR0VjNoUklDUkRZOXpDa0RscEJoRjQyVVFVZldWQVdCRnMiLCJ5IjoiOVZFNGpmX09rX282NHpiVFRsY3VOSmFqSG10NnY5VERWclUwQ2R2R1JEQSIsImNydiI6IlAtMjU2In19.eyJqdGkiOiJwS2piNGFEZjEiLCJodG0iOiJQT1NUIiwiaHR1IjoiaHR0cHM6Ly9zZXJ2ZXIuZXhhbXBsZS5jb20vZGYtYXV0aGVudGljYXRpb24vY2FuY2VsIiwiaWF0IjoxNzYzNzIzMTkwfQ.Ux89nsFXQLRKJxW5OZrOTSSQWtRAZsfB5542hICkOoOBQIOZua5US4sX7JLUqklykKSCHKeWB1FFZF4PJCmTikY9-RQPKh_rQlGFXUjnUUuAi_zatJPMh3e94EdHzHXIkUpNHV6HOTQfJZntM-eRZMGLBoFGKEiHpJlWSLWtV6pRV4GIvE8FgimNP111G_8ZSfty6K-gmIUlDZHl7LHo1GotiRuGyQOxiyqEPqV35unZiskdyIsisnA2O7nXViAD9ARuGAuM-eFlE6QJ1ji4aAPAUJnPLA0mbRhsP2DYU8YDee9tAbAkl9e45l9zhLsdEbQT07yv8zMb7zuRuczQZQ

{
  "deferred_auth_id": "SplxlOBeZQQYbYS6WxSbIA"
}
```

## Authentication Cancellation Request Validation

The OP MUST validate the request received as follows:

1. Authenticate the Client in accordance with Section 9 of [@!OpenID.Core].
2. Ensure the given `deferred_auth_id` was issued to the authenticated Client.
3. If a DPoP proof was provided in the [Deferred Code Exchange Request](#deferred-code-exchange-request)
   1. Validate that a DPoP proof is provided in this request.
   2. If the Client is a Public Client, verify that the public key used in this DPoP proof matches the one used in the Deferred Code Exchange Request.
4. If a DPoP proof is provided in this request, validate it in accordance with [@!RFC9449, section 4.3].
5. Verify that no access token has been previously issued for the Deferred Authentication.

After successful validation, the OP marks this Authentication Request as cancelled. Any requests to poll for the result of the Authentication Process after the OP accepts the cancellation request MUST be handled as described in (#token-request-error-response). 

Disposal of any collected Identity Information is beyond the scope of this specification.

## Authentication Cancellation Response

The OP responds to the Authentication Cancellation Request with an HTTP 200 status code if the cancellation was successful, or if the RP submitted an invalid or already-processed `deferred_auth_id`.

Since the purpose of this request is to stop the Authentication Process, distinction of the cancellation outcome is not necessary for the RP.
This behavior is similar to [@!RFC7009, section 2.2].

The following is a non-normative example of an authentication cancellation response:

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
```

# Token Request Error Response {#token-request-error-response}

If the Token Request is invalid or unauthorized, or if the Authentication Process has not yet completed, the OpenID Provider returns an error response as described in section 3.1.3.4 of [@!OpenID.Core].

In Addition to the error codes defined in [@!RFC6749, section 5.2], this specification uses error codes defined in [@!RFC8628, section 3.5], [@!RFC9449, section 5] and section 11 of [@!OpenID.CIBA]:

`authorization_pending`
:   The Authentication is being processed and has not yet completed.

`slow_down`
:   The Client is polling too quickly and MUST slow down the rate of requests. The interval between requests MUST be increased by at least 5 seconds.

`expired_token`
: The `deferred_auth_id` has expired. The Client MUST stop polling with this `deferred_auth_id` and MAY restart the Authentication Process.

`access_denied`
:   The Identity Information couldn't be attested according to the requirements of the Authentication Request, or the Authentication Process was cancelled.

`invalid_dpop_proof`
: The DPoP proof is missing, invalid, or does not match the requirements of (#token-request-using-the-authentication-request-id).

The following behaviors apply to the error responses:

* If the `deferred_auth_id` is invalid or was issued to another Client, an `invalid_grant` error MUST be returned as defined in [@!RFC6749, section 5.2].

* If a Client continually polls faster than the `interval` parameter of the Deferred Code Exchange Response, the OP MAY respond with an `invalid_request` error.

* If a Client receives an `invalid_request` error, it MUST not make any further requests for the same `deferred_auth_id`.

The error response MUST be encoded in `application/json` media type with the following parameters:

`error`
: REQUIRED. A single ASCII error code as described above.

`error_description`
: OPTIONAL. Human-readable ASCII [USASCII] text to assist the client developer.

`error_uri`
: OPTIONAL. A URI of a web page with information about the error to provide the client developer with additional information.

The following is a non-normative example of a Token Request Error Response:

```
HTTP/1.1 400 Bad Request
Content-Type: application/json
Cache-Control: no-store

{
  "error": "authorization_pending",
  "error_description": "The authentication is still being processed."
}
```

# Deferred Code Exchange Error Response

If the Deferred Code Exchange Request is invalid or unauthorized, the OpenID Provider constructs an error response as described in section 3.1.3.4 of [@!OpenID.Core]. The Deferred Code Exchange extends the definition of the following error code:

`invalid_grant`
: The `deferred_code` is invalid, expired, or was issued to another Client.

When using DPoP [@!RFC9449], the following error code is also applicable:

`invalid_dpop_proof`
: The DPoP proof is missing, invalid, or does not match the requirements of (#deferred-code-exchange-request).

The error response parameters MUST be encoded in `application/json` media type with the following parameters:

`error`
: REQUIRED. Error code.

`error_description`
: OPTIONAL. Human-readable ASCII encoded text description of the error.

`error_uri`
: OPTIONAL. URI of a web page that includes additional information about the error.

The following is a non-normative example of a Deferred Code Exchange Error Response:

```
HTTP/1.1 400 Bad Request
Content-Type: application/json
Cache-Control: no-store

{
  "error": "invalid_grant",
  "error_description": "The request grant is invalid, expired, or was issued to another client."
}
```

# Authentication Request Error Response {#authentication-request-error-response}

When an Authentication Request is invalid, or the End-User cancels or fails to provide Identity Information, the OpenID Provider creates an Authentication Error Response.

This error response means that no further processing will be performed for the corresponding Authentication Request. The OP MUST return the error response in accordance with section 3.1.2.6 of [@!OpenID.Core].

The error response parameters are the following:

`error`
: REQUIRED. Error code.

`error_description`
: OPTIONAL. Human-readable ASCII encoded text description of the error.

`error_uri`
: OPTIONAL. URI of a web page that includes additional information about the error.

`state`
: OAuth 2.0 state value. REQUIRED if the Authorization Request included the state parameter. Set to the value received from the Client.

Response error parameters MUST be encoded in accordance to the `response_mode` used in the original [Authentication Request](#authentication-request). See [@?OAuth.Responses] and [@?OAuth.Post] for examples.


The following is a non-normative example of an Authentication Request Error Response:

```
HTTP/1.1 302 Found
  Location: https://client.example.org/cb?
    error=unauthorized_client
    &error_description=
      Client%20is%20not%20authorized%20to%20use%20deferred_code%20response%20type
    &state=af0ifjsldkj
```

# Authentication Cancellation Request Error Response

When an invalid Authentication Cancellation Request is received, the OpenID Provider returns an error response that contains one of the following error codes:

`invalid_request` 
: The request is missing a required parameter, or is otherwise malformed.

`invalid_client`
: Client authentication failed (e.g. invalid client credentials, unknown client, no client authentication included, or unsupported authentication method). The authorization server MAY return an HTTP 401 (Unauthorized) status code to indicate which HTTP authentication schemes are supported. If the client attempted to authenticate via the "Authorization" request header field, the authorization server MUST respond with an HTTP 401 (Unauthorized) status code and include the "WWW-Authenticate" response header field matching the authentication scheme used by the client.

`unauthorized_client`
: The authenticated client is not authorized to use the Deferred Code Grant Type.

`invalid_dpop_proof`
: The DPoP proof is missing, invalid, or does not match the requirements of [Authentication Cancellation Request](#authentication-cancellation-request).

The error response MUST use the 400 status code unless explicitly specified otherwise, and parameters MUST be encoded in `application/json` media type:

`error`
: REQUIRED. A single ASCII error code as described above.

`error_description`
: OPTIONAL. Human-readable ASCII [USASCII] text to assist the client developer.

`error_uri`
: OPTIONAL. A URI of a web page with information about the error to provide the client developer with additional information.

The following is a non-normative example of a Deferred Code Exchange Error Response:

```
HTTP/1.1 400 Bad Request
Content-Type: application/json
Cache-Control: no-store

{
  "error": "unauthorized_client",
  "error_description": "The client is not authorized to use the Deferred Code Grant Type."
}
```

# Implementation Considerations

## Interim ID Tokens

The Interim ID Token MAY contain both validated and unvalidated claims about the End User.
The scheme used to distinguish validated claims from unvalidated claims is outside the scope of this specification.
Options include:
1. Using the `verified_claims` from [@?OpenID4IDA].
2. Coordination between each Client and OP to define claim names.

## Multi-valued Response Type Authentication Request

The OP MAY accept Authentication Requests providing the response type value as `deferred_code code`. In those cases, it means for the OP that it MAY chose, by its own means, when the Authentication response will be of deferred type or any other provided alternative. 

## Design Considerations for Poll and Ping {#design-considerations-for-poll-and-ping}
This specification intentionally does not define a "push" mode for delivering a Token Response.
The push mode is not appropriate for long-running high-value Authentication Processes since losing the single push request would mean losing the outcome of the entire Authentication Process.

The Ping Callback enables long-running Authentication Processes to occur without wasting network resources on a large amount of Poll requests.

In case an OpenID Provider returns an `authorization_pending` Token Request Error Response after sending a Ping Callback, the Relying Party SHOULD keep sending Token Requests.
This improves the success rates in distributed systems that may incorrectly send Ping Callbacks too early and prevents denial-of-service attacks in case the Deferred Client Notification Endpoint is compromised.

## Context on the Progress of Incomplete Authentication Processes

OpenID Providers SHOULD include appropriate context regarding the progress of the Authentication Process when responding with a Token Request Error Response because the Authentication Process has not yet been completed.
Such context SHOULD be included in the `error_description` field of the Token Request Error Response.

Appropriate context regarding the progress depends on the use case and the nature of the Authentication Process and the Identity Information.
The Relying Party MAY forward the context to the End User if appropriate.

Examples of appropriate context regarding the progress of the Authentication Process include:
1. If the Authentication Process includes multiple steps, the step currently being performed.
2. If the OpenID Provider uses a queue system to schedule Authentication Process work, the number of Authentication Processes queued before the current one.
3. An estimate of the remaining processing time, if available.

The OpenID Provider MAY communicate the progress of each Authentication Process to the Relying Party in other ways.
Mechanisms for doing so are outside the scope of this specification.

# Privacy Considerations

# Security Considerations

In addition to the security considerations described in [@!RFC6749], [@!RFC7519], [@!RFC9449], and [@!OpenID.Core], the following considerations apply to this specification.

## Usage of Deferred Notification Tokens
The `deferred_notification_token` is a bearer token that enables the OP to authenticate to the RP when sending the Ping Callback. Therefore, it is imperative that this token is protected against unauthorized access and disclosure.

This token SHOULD be generated following the least privilege principle, ensuring it can only be used for its intended purpose of authenticating the OP to the RP during the Ping Callback.

If the Client chooses not to use Deferred Notification Tokens to protect the Deferred Notification Endpoint, the Client MUST protect the endpoint in some other way.
One option is to use mutual TLS.

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
<reference anchor="OpenID4IDA" target="https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html">
  <front>
    <title>OpenID Connect for Identity Assurance 1.0</title>
    <author fullname="Torsten Lodderstedt" initials="T." surname="Lodderstedt">
      <organization abbrev="sprind.org">sprind.org</organization>
    </author>
    <author fullname="Daniel Fett" initials="D." surname="Fett">
      <organization abbrev="Authlete">Authlete</organization>
    </author>
    <author fullname="Mark Haine" initials="M." surname="Haine">
      <organization abbrev="Considrd.Consulting Ltd">Considrd.Consulting Ltd</organization>
    </author>
    <author fullname="Alberto Pulido" initials="A." surname="Pulido">
      <organization abbrev="Santander">Santander</organization>
    </author>
    <author fullname="Kai Lehmann" initials="K." surname="Lehmann">
      <organization abbrev="1&amp;1 Mail &amp; Media Development &amp; Technology GmbH
">1&amp;1 Mail &amp; Media Development &amp; Technology GmbH
      </organization>
    </author>
    <author fullname="Kosuke Koiwai" initials="K." surname="Koiwai">
      <organization abbrev="KDDI Corporation">KDDI Corporation</organization>
    </author>
    <date day="1" month="October" year="2024"/>
  </front>
</reference>
<reference anchor="OAuth.Responses" target="https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html">
  <front>
	  <title>OAuth 2.0 Multiple Response Type Encoding Practices</title>
	  <author fullname="Breno de Medeiros" initials="B." role="editor" surname="de Medeiros">
	    <organization abbrev="Google">Google</organization>
	  </author>
	  <author fullname="Marius Scurtescu" initials="M." surname="Scurtescu">
	    <organization abbrev="Google">Google</organization>
	  </author>
	  <author fullname="Paul Tarjan" initials="P." surname="Tarjan">
	    <organization abbrev="Facebook"> Facebook</organization>
	  </author>
	  <author fullname="Michael B. Jones" initials="M.B." surname="Jones">
	    <organization abbrev="Microsoft">Microsoft</organization>
	  </author>
	  <date day="25" month="February" year="2014" />
  </front>
</reference>
<reference anchor="OAuth.Post" target="http://openid.net/specs/oauth-v2-form-post-response-mode-1_0.html">
  <front>
	  <title>OAuth 2.0 Form Post Response Mode</title>
	  <author fullname="Michael B. Jones" initials="M.B." surname="Jones">
	    <organization abbrev="Microsoft">Microsoft</organization>
	  </author>
	  <author fullname="Brian Campbell" initials="B." surname="Campbell">
	    <organization abbrev="Ping Identity">Ping Identity</organization>
	  </author>
	  <date day="25" month="February" year="2014" />
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
