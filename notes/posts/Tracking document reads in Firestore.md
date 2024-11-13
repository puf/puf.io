---
title: Tracking document reads per user in Firestore
pubDate: November 30, 2024
alsoOn: []
---

Introduction: use-case, not possible initially, possible since.

Firestore is a serverless NoSQL database. For most projects, the largest part of their Firestore cost comes from *document reads*. You pay this cost each time the Firestore database server reads a document from disk for your app.

A common request from developers using Firestore is to see how many document reads each of their users are causing. Initially this was not possible in Firestore, since no metrics were exposed for this. But [since late 2021](audit-log-release) Firestore supports writing [audit logs][audit-logging], and with that it *is* now possible to see the document read operations per user - and many more metrics across many more axes.

In this article we'll see how to make a chat like this that shows the document read count per use per day over a period of time:

![](https://i.imgur.com/MrUmLQ6.png)

### Use-case

Let's briefly look at the use-case first. I built a tiny chat app in FlutterFlow. This app has a single collection (called `chat`) and in that collection each document represents a single chat message. My app allows the user to send a message (adding a new document to the collection), and it shows the (up to) 10 most recent messages from the collection.

In Flutter code, adding a message looks like this:
```

```

And the reading of messages is done with this code:
```

```

So this really just uses a tiny sliver of the possible Firestore operations, no get-style reads, no transactions, no batches. That's both because I usually live-code this app, but it also helps to keep our logs focused.

### Audit logs

<<<<<<< Updated upstream
Admin logs automatic
Read and write logs opt-in
Method name is the other key, and this list is far from complete
Note that the cound for DATA_* events will likely be much higher than for ADMIN_* events, hence those being opt-in
=======
As you can probably imagine, there's a boatload of information that Firestore can log. At the top level, the audit logs are split into these two most common [types][audit-log-types]:
>>>>>>> Stashed changes

* **Admin Activity audit logs** contain log entries for API calls or other actions that modify the configuration or metadata of resources. For example, these logs record when users create VM instances or change Identity and Access Management permissions. Admin Activity audit logs are always written; you can't configure, exclude, or disable them.

* **Data Access audit logs**  contain API calls that read the configuration or metadata of resources, as well as user-driven API calls that create, modify, or read user-provided resource data. Data Access audit logs are disabled by default, because audit logs can be quite large. If you want Data Access audit logs to be written for Google Cloud services other than BigQuery, you must explicitly enable them

So I went into the Google Cloud console and [enabled data logging][enable-data-logging]. 

After this I loaded up my Flutter app in both an iOS emulator and a web page, and went looking for the data access audit logs.

### Cloud Logging: Logs Explorer

One of the first tools you'll want to look at is the Log Explorer. If you like reading first, check the documentation on [viewing logs by using the Logs Explorer][logs-explorer], but I prefer diving in. The log explorer lets you view recent log entries in this format:

![](https://i.imgur.com/mBxWcA4.png)

Yup indeed, that is rather dense. And this is just the summary, you're not even seeing 10% of the actual details in there. The amount of information that gets logged is huge!

Most important to note is that the logs are chronological, so the newest is at the bottom, and that you can see the (truncated) method name in there right after `firestore.googleapis.com`. So the methods we see in the screenshot above are `google.firestore.v1.Firestore.Listen`, `...v1.FirestoreAdmin.GetDatabase`, `...v1.FirestoreAdmin.ListLocations`, and more. You'll immediately note that most of these are admin-level logs, which we're not interested in right now. 

After testing for a few days, here's the count of the number of log entries by method:

![](https://i.imgur.com/SdbRuAq.png)

*Remember that earlier warning about there being lots of data access logs? They weren't kidding.*

We only care about the regular data access logs, and the only two methods we find for that are:

* `google.firestore.v1.Firestore.Listen`, which corresponds to our listener for the 10 most recent messages.
* `google.firestore.v1.Firestore.Write`, which is not showing in the above screenshot, but it pops up when a user sends a message.

As expected, it's mostly listen operations for us here, as I really haven't been sending a lot of messages during testing.

---

### What's in a log message

As I said above, there is **a lot** of information on each of these messages and so far we've only seen a tiny bit. If you click on the `>` to the left of a log entry, you can see its details. This is the full JSON for one (seriously: just one!) of the `Listen` entries:

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
* `protoPayload/authenticationInfo/thirdPartyPrincipal/payload/user_id`  is the UID of the (anonymous) user
* `protoPayload/request/addTarget/query/structuredQuery` shows us that our query is something like `collection('chat').orderBy('timestamp', 'DESC').limit(10)`
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

[audit-logging]: https://cloud.google.com/firestore/docs/audit-logging
[audit-log-release]: https://github.com/firebase/extensions/blob/next/firestore-bigquery-export/guides/OBSERVABILITY.md
[audit-log-types]: https://cloud.google.com/logging/docs/audit#types
[enable-data-logging]: https://cloud.google.com/logging/docs/audit/configure-data-access
[log-explorer]: https://cloud.google.com/logging/docs/view/logs-explorer-interface