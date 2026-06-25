## Notification System Design

## Stage 1 – REST API Design

### Fetch Notifications

**Endpoint**

```http
GET /notifications?studentID=1042
```

**Response**

```json
[
  {
    "id": "uuid",
    "type": "Placement",
    "message": "CSX Corporation hiring",
    "timestamp": "2026-04-22 17:51:18",
    "isRead": false
  }
]
```

---

### Add Notification

**Endpoint**

```http
POST /notifications
```

**Request Body**

```json
{
  "studentID": 1042,
  "type": "Placement",
  "message": "CSX Corporation hiring"
}
```

**Response**

```json
{
  "id": "uuid",
  "status": "created"
}
```

---

### Mark Notification as Read

**Endpoint**

```http
PATCH /notifications/{id}
```

**Request Body**

```json
{
  "isRead": true
}
```

**Response**

```json
{
  "message": "Notification marked as read"
}
```

---

### Delete Notification

**Endpoint**

```http
DELETE /notifications/{id}
```

**Response**

```json
{
  "message": "Notification deleted successfully"
}
```

---

### Real-Time Notification Delivery

To provide instant notification updates, either of the following technologies can be used:

* WebSockets
* Server-Sent Events (SSE)

These approaches eliminate the need for frequent client polling and reduce server load.

---

## Stage 2 – Database Schema Design

### Database Choice

A relational database such as PostgreSQL or MySQL is suitable because notifications require:

* Strong consistency
* Structured relationships
* Efficient querying
* ACID compliance

### Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    studentID INT NOT NULL,
    type VARCHAR(20),
    message TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isRead BOOLEAN DEFAULT FALSE
);
```

### Scalability Challenges

As notification volume grows:

* Query latency increases
* Index sizes become larger
* Storage requirements grow significantly

### Mitigation Strategies

* Composite indexing
* Table partitioning
* Redis caching
* Database sharding

### Example Query

```sql
SELECT id, type, message, createdAt
FROM notifications
WHERE studentID = 1042
  AND isRead = false;
```

---

## Stage 3 – Query Optimization

### Original Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt DESC;
```

### Performance Issues

For large datasets, the query may:

* Scan many rows
* Perform filtering operations
* Execute expensive sorting

### Optimized Query

```sql
SELECT id, type, message, createdAt
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt DESC
LIMIT 50;
```

### Recommended Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt DESC);
```

### Benefits

* Faster filtering
* Reduced sorting overhead
* Improved scalability
* Lower CPU and I/O utilization

---

## Stage 4 – Performance on Page Load

### Problem

Fetching notifications from the database on every page load can overwhelm the database and increase response times.

### Solutions

#### Caching

Use Redis or Memcached to store frequently accessed notifications.

**Pros**

* Fast responses
* Reduced database load

**Cons**

* Cache invalidation complexity

#### Pagination / Lazy Loading

Load notifications in smaller batches.

**Pros**

* Lower network overhead
* Faster page rendering

**Cons**

* Users may not see older notifications immediately

#### Push-Based Updates

Use WebSockets or SSE to send notifications only when changes occur.

**Pros**

* Real-time updates
* Fewer redundant requests

**Cons**

* Persistent server connections required

---

## Stage 5 – Reliable Notify-All Design

### Problems with Sequential Processing

A simple loop may fail when:

* Email delivery fails
* External services become unavailable
* Large notification batches are processed

### Improved Architecture

Use asynchronous message queues:

* RabbitMQ
* Apache Kafka

### Workflow

1. Store notification in database.
2. Publish event to queue.
3. Background workers process delivery.
4. Retry failed deliveries automatically.

### Pseudocode

```python
function notify_all(student_ids, message):
    for student_id in student_ids:
        save_to_db(student_id, message)
        enqueue("email_queue", {student_id, message})
        enqueue("push_queue", {student_id, message})
```

### Benefits

* Better fault tolerance
* Improved scalability
* Independent processing of delivery channels

---

## Stage 6 – Priority Inbox

### Requirement

Display the top N unread notifications based on:

* Notification priority
* Recency

### Priority Weights

| Type      | Weight |
| --------- | ------ |
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

### Efficient Approach

Maintain a Min-Heap of size N.

### Python Example

```python
import heapq
from datetime import datetime

weights = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}

def score(notification):
    timestamp = datetime.strptime(
        notification["Timestamp"],
        "%Y-%m-%d %H:%M:%S"
    )
    recency = int(timestamp.timestamp())
    return weights[notification["Type"]] * 1000000000 + recency

def top_n_notifications(notifications, n=10):
    heap = []

    for notif in notifications:
        s = score(notif)

        if len(heap) < n:
            heapq.heappush(heap, (s, notif))
        else:
            heapq.heappushpop(heap, (s, notif))

    return [
        notif
        for _, notif in sorted(heap, reverse=True)
    ]
```

### Complexity

* Time Complexity: O(n log k)
* Space Complexity: O(k)

where:

* n = total notifications
* k = number of notifications displayed
