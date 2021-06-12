# NOTES: TODO REMOVE

### Indices used on PSQL
```
CREATE INDEX top_index
    ON reddit_data (ups);

CREATE INDEX name_index
    ON reddit_data (name);

CREATE INDEX body_index
    ON reddit_data (body); /* fails */


CREATE INDEX body_tsv_index ON reddit_data
    USING gin(to_tsvector('simple',body));

ALTER TABLE reddit_data ADD COLUMN tsv tsvector;

UPDATE reddit_data SET tsv =
    setweight(to_tsvector(author), 'A') ||
    setweight(to_tsvector(body), 'B') ||
    setweight(to_tsvector(subreddit), 'C');
 /* [2021-06-12 17:22:28] 10540672 rows affected in 37 m 29 s 226 ms */ XD

```

note:
[54000] word is too long to be indexed
