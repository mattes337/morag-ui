# General
- Configure Databases containing graph/vector databases
- Each database can have any number of documents
- Each document can be queried on individually
- The complete database can be queried
- All databases can be queried
	- Use a classifier agent, hand it the databases there are for the user, decide which databases to use
- Realms can be configured:
	- Domain: which information is relevant
	- Extraction prompt: the custom prompt for entity extraction
	- Query prompt: a system prompt for any retrieval
- Documents can be deleted
	- Delete document, chunks and facts - keep entities even if they get orphaned

# Blog Authoring
- Automatically create blog articles from databases
- Create an idea table, fill it automatically or manually
- An idea must be approved by the user
- Ideas are then drafted as articles
- Article drafts can be edited in markdown