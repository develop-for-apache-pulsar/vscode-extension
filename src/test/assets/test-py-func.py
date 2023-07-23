from pulsar import Function

class ExclamationFunction(Function):
    def __init__(self):
        pass

    def process(self, input, context):
        return input + '!'