# Deferred Token Response

This document illustrates why deferring an authorization response is useful in scenarios where the authorization decision can't be made immediately. 

## Sample Scenario 1 - Transaction Authorization

An online banking application requests authorization to schedule or execute a transaction. Its risk policy may require complex checks which can probably take a few minutes to hours to complete. It is not necessary for the user to remain engaged with the application while the authorization decision is being made. The verification process could include manual review, awaiting the response of multiple parties or contacting the user by another channel.

## Sample Scenario 2 - Step-up Identity Assurance

Extensive Identity proof may be requested during a transaction, such as applying for a loan. The user may be required to provide information such as a government-issued ID, which may be automatically validated, or require manual review and verification. If the second occurs, the authorization may take longer to complete.

## Sample Scenario 3 - Account recovery

During an account recovery process, the user may not have access to any of their registered devices, and may not be able to present any previous registered credentials. To avoid account takeover, the authorization server may collect identity proof through photo id, government-issued documents, request a grace period and register the current device as a pending device for interaction with no effect on the previously registered devices. The authorization decision may take a long time to complete, and the user doesn't have to remain engaged with the application while the authorization decision is being made.

## Obstacles to Immediate Authorization Grant Types

Using typical OAuth 2.0 flows, both Client, Resource Server and Authorization Server would have to agree on an anti-pattern to handle this situation, or penalize user experience. Possible approaches could include:

- **Denying the request and asking the client to retry later**: This approach is not user-friendly and can lead to a poor user experience, as the client has to handle the retry logic and may not know when to retry. This would also require further user interaction to re-initiate the authorization request, which can be cumbersome.
- **Issue an access token with claims that indicate the authorization is pending**: Token issuance itself means that access is granted access to a resource. This would be a token with no granted access, which demands careful handling and clear communication to the client and resource server about the pending status.
- **Ask user to wait for the authorization decision**: This approach can lead to a poor user experience, as the user may have to wait on-screen for the authorization decision. HTTP Session timeouts, app restarts in background and other issues may arise, leading to a frustrating experience for the user.

## Use of other Grant Types

Both OAuth 2.0 and OpenID Connect define grant types where asynchronous authorization response is possible. Device Authorization Grant and CIBA (Client Initiated Backchannel Authentication) are two examples of grant types that allow for deferred authorization responses.

These grant types would require client adoption for all of the authorization requests it makes. It cannot predict if the authorization decision will be made immediately or if it will take time. Each of these grant type have additional downsides:

**Device Authorization Grant**:
- **It's intended for authorizing on a distinct device**: This grant type introduces a polling mechanism that can acommodate long-running tasks, although, it is not designed for this scenario. Polling during user interaction is not ideal if interaction is on the same device. It doesn't accomodate user interaction URI, redirection URI and other parameters to drive the user-agent from the client to the authorization and vice versa. All of those would have to be agreed upon by the client and authorization server, which is not ideal for a generic solution.
  

**CIBA**:
- **It's mainly intended for authorizing on a distinct device**: When the user is not interacting directly with the requesting client, CIBA is a good fit. However, it is not designed for this scenario where the user is interacting with the client on the same device. It introduces the same unecessary polling as Device Authorization Grant for non-long running tasks. Also, it makes the assumption that the user has a registered device that can be reached out-of-band, which may not be the case for all deployments.
- **It's intended for authorizing an already known user**: Reaching out the user through a registered device is not always possible, especially in scenarios where the user is not known to the authorization server or the device is not available. This can lead to a poor user experience and may not be feasible for all users.