# Develop for Apache Pulsar

This extension provides support for [Apache Pulsar](https://pulsar.apache.org/) in VSCode. Currently, it supports the following features:

- Connect to a Pulsar cluster and list resources
- Save your Pulsar cluster configuration for easy access
- Create a topic
- Watch & search topic messages (with websocket)
  - No message acknowledgement
  - Decode schemed messages (JSON, AVRO, PROTOBUF, BYTES, STRING)
  - View message details (properties, size, timestamp, etc.)
- Get topic schema (if one is present)
- Use VSCode's tab and split view to view multiple topics at once. Line each topic watch window side-by-side to view messages as they flow through a pipeline.

Once installed you'll notice a new Pulsar icon in the activity bar. Click it to activate the extension and see the option to save your providers' configuration.