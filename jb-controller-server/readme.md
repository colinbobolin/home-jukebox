# Request Handler

- Independent Process
- single user logged in
- accept requests via api

requests will have the form:

```json
{
    "track_id": string,
    "request_timestamp": timestamp,
}
```

need to track
- the number of requests per user
- "# jukebox-controller" 
