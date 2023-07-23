# Develop for Apache Pulsar

This extension provides support for [Apache Pulsar](https://pulsar.apache.org/) in VSCode. Currently, it supports the following features:

- Cluster resources
  - List clusters, tenants, namespaces, topics, connectors, functions
  - Save your Pulsar cluster configuration for easy access

- Topics
  - Create, delete a topic
  - Watch & search topic messages (with websocket)
  - Topic message details (properties, size, timestamp, etc.)
  - Decode schemed messages (JSON, AVRO, PROTOBUF, BYTES, STRING)
  - View message details (properties, size, timestamp, etc.)
  - Get topic schema (if one is present)
  - Get topic statistics, properties

- Functions
  - List instances
  - Info, status, statistics about function
  - Watch associated topics (inputs, outputs, log, dead letter)
  - Start, stop, restart, delete function
  - Start, stop function instances
  - Delete function
  - Create new function**
  - Auto sense a function manifest and show deploy shortcuts**
  - Auto sense a function manifest and show runtime package options

     ```
     py: choose .py file or choose a folder to (automatically) zip
     java: choose .jar or .nar file
     go: choose go executable
     ```

** This feature is not compatible with Pulsar 3.0

Once installed you'll notice a new Pulsar icon in the activity bar. Click it to activate the extension and see the option to save your providers' configuration.