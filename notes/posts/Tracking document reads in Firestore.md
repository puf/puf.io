---
title: Tracking document reads per user in Firestore
pubDate: November 12, 2024
alsoOn: []
---

Introduction: use-case, not possible initially, possible since.

My use-case: FlutterFlow chat app, listener only and simple writes (so no get, no transactions, no batches)

### Audit logs

Admin logs automatic
Read and write logs opt-in
Method name is the other key, and this list is far from complete
Note that the cound for DATA_* events will likely be much higher than for ADMIN_* events, hence those being opt-in

### Cloud Logging: Log Explorer

Event tyoes/API calls
Protobuf

```json
{
  "protoPayload": {
    "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
    "status": {},
    "authenticationInfo": {
      "principalEmail": "service-942941060459@firebase-rules.iam.gserviceaccount.com",
      "thirdPartyPrincipal": {
        "@type": "type.googleapis.com/google.cloud.audit.ThirdPartyJwt",
        "payload": {
          "payload": {
            "sign_in_provider": "anonymous",
            "identities": {}
          },
          "iss": "https://securetoken.google.com/nanochat-20241022-mw8qu9",
          "iat": 1731091820,
          "aud": "nanochat-20241022-mw8qu9",
          "provider_id": "anonymous",
          "sub": "mzi2JtP9p1fxavXdVvuk2qMyIWB3",
          "auth_time": 1731007799,
          "user_id": "mzi2JtP9p1fxavXdVvuk2qMyIWB3",
          "exp": 1731095420
        },
        "header": {
          "typ": "JWT",
          "alg": "RS256",
          "kid": "b8cac95b4a5acde0b96572dee8c8c95eee48cccd"
        }
      }
    },
    "requestMetadata": {
      "callerIp": "157.131.245.100",
      "callerSuppliedUserAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36,gzip(gfe),gzip(gfe)",
      "requestAttributes": {
        "time": "2024-11-08T19:14:57.226501Z",
        "auth": {}
      },
      "destinationAttributes": {}
    },
    "serviceName": "firestore.googleapis.com",
    "methodName": "google.firestore.v1.Firestore.Listen",
    "authorizationInfo": [
      {
        "resource": "projects/nanochat-20241022-mw8qu9/databases/(default)",
        "permission": "datastore.entities.get",
        "granted": true,
        "resourceAttributes": {
          "service": "firestore.googleapis.com",
          "name": "projects/nanochat-20241022-mw8qu9/databases/(default)",
          "type": "firestore.googleapis.com/Database"
        },
        "permissionType": "DATA_READ"
      },
      {
        "resource": "projects/nanochat-20241022-mw8qu9/databases/(default)",
        "permission": "datastore.entities.list",
        "granted": true,
        "resourceAttributes": {
          "service": "firestore.googleapis.com",
          "name": "projects/nanochat-20241022-mw8qu9/databases/(default)",
          "type": "firestore.googleapis.com/Database"
        },
        "permissionType": "DATA_READ"
      }
    ],
    "resourceName": "projects/nanochat-20241022-mw8qu9/databases/(default)",
    "numResponseItems": "10",
    "request": {
      "@type": "type.googleapis.com/google.firestore.v1.ListenRequest",
      "addTarget": {
        "targetId": 102,
        "query": {
          "parent": "projects/nanochat-20241022-mw8qu9/databases/(default)/documents",
          "structuredQuery": {
            "limit": 10,
            "from": [
              {
                "collectionId": "chat"
              }
            ],
            "orderBy": [
              {
                "direction": "DESCENDING",
                "field": {
                  "fieldPath": "timestamp"
                }
              },
              {
                "direction": "DESCENDING",
                "field": {
                  "fieldPath": "__name__"
                }
              }
            ]
          }
        }
      }
    },
    "metadata": {
      "@type": "type.googleapis.com/google.cloud.audit.DatastoreServiceData"
    }
  },
  "insertId": "-itd58hf2gzijg",
  "resource": {
    "type": "audited_resource",
    "labels": {
      "project_id": "nanochat-20241022-mw8qu9",
      "service": "firestore.googleapis.com",
      "method": "google.firestore.v1.Firestore.Listen"
    }
  },
  "timestamp": "2024-11-08T19:14:57.217715Z",
  "severity": "INFO",
  "logName": "projects/nanochat-20241022-mw8qu9/logs/cloudaudit.googleapis.com%2Fdata_access",
  "operation": {
    "id": "3c9374e7-6d46-4619-ad12-a0bfbfac16b1",
    "producer": "firestore.googleapis.com",
    "last": true
  },
  "receiveTimestamp": "2024-11-08T19:14:57.639965123Z"
}
```

As said: it's a boatload of data, but here are some of the most interesting paths in the JSON for our use-case:

* `protoPayload/authenticationInfo` is the (Firebase) Authentication of the user who made the request.
* `protoPayload/authenticationInfo/thirdPartyPrincipal/payload/sign_in_provider` shows that the client is signed in anonymously.
* `protoPayload/authenticationInfo/thirdPartyPrincipal/oayload/user_id`  is the UID of the (anonymous) user
* `protoPauload/request/addTarget/query/structuredQuery` shows us that our query probably looks like `collection('chat').orderBy('timestamp', 'DESC').limit(10)`
* `protoPayload/requestMetadata/callerSuppliedUserAgent` shows the user agent that made the request (so we could derive the client platform from that)
* `protoPayload/numResponseItems` shows the number of items that were returns in this request



### Cloud Logging: Log Analytics

SQL based

![logging query samples](https://cloud.google.com/logging/docs/analyze/examples)

```sql
SELECT
  JSON_VALUE(proto_payload.audit_log.authentication_info.third_party_principal.payload.user_id) as uid,
  TIMESTAMP_TRUNC(timestamp, DAY) as day,
  SUM(proto_payload.audit_log.num_response_items) as read_count
FROM `nanochat-20241022-mw8qu9.global._Default._AllLogs`
WHERE proto_payload.audit_log.authorization_info[0].permission_type IN ('DATA_READ', 'DATA_WRITE')
  AND proto_payload.audit_log.method_name LIKE 'google.firestore.v1.Firestore%'
GROUP BY 
  JSON_VALUE(proto_payload.audit_log.authentication_info.third_party_principal.payload.user_id), 
  TIMESTAMP_TRUNC(timestamp, DAY)
```