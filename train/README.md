# Helper corpus

Giti.one is the ERP. This folder is an optional helper trained on **public English docs** in this tree. It is not the product. Do not publish Giti.one as an AI ERP.

```bash
node train/build-corpus.js
```

That writes `train/corpus.jsonl` (question/answer rows plus the markdown sources). Point a local supervised-fine-tune tool at that file. Weights do not belong in this repository.

The builder refuses third-party product names and skips LinkedIn drafts.
