# Develop for Apache Pulsar

This extension provides support for [Apache Pulsar](https://pulsar.apache.org/) in VSCode. Currently, it supports the following features:

- Cluster resources
  - List clusters, tenants, namespaces, topics, connectors, functions
  - Save your Pulsar cluster configuration for easy access

- Topics
  - Create a topic
  - Watch & search topic messages (with websocket)
  - Topic message details (properties, size, timestamp, etc.)
  - Decode schemed messages (JSON, AVRO, PROTOBUF, BYTES, STRING)
  - View message details (properties, size, timestamp, etc.)
  - Get topic schema (if one is present)

- Functions
  - List instances
  - Info, status, statistics about function
  - Watch associated topics (inputs, outputs, log, dead letter)
  - Start, stop, restart, delete function
  - Start, stop function instances

Once installed you'll notice a new Pulsar icon in the activity bar. Click it to activate the extension and see the option to save your providers' configuration.