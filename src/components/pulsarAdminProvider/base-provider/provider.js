"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
const TTopic_1 = require("../../../types/TTopic");
const index_1 = require("../../../../../typescript/dist/src/index");
class BaseProvider {
    constructor(webServiceUrl, pulsarToken) {
        if (webServiceUrl === null || webServiceUrl === undefined) {
            throw new Error("Web service url is required");
        }
        if (pulsarToken === undefined) {
            this.client = index_1.default.builder()
                .serviceHttpUrl(webServiceUrl)
                .build();
        }
        else {
            this.client = index_1.default.builder()
                .serviceHttpUrl(webServiceUrl)
                .tokenAuthentication(pulsarToken)
                .build();
        }
    }
    async QueryPulsarAdminClient(fn, def) {
        return new Promise((resolve, reject) => {
            fn.then((response) => {
                if (response.status === 200) {
                    resolve(response.data);
                    return;
                }
                reject(response);
            }).catch((err) => {
                if (this.shouldRejectError(err)) {
                    reject(err);
                    return;
                }
                resolve(def);
            });
        });
    }
    shouldRejectError(err) {
        return !(err.code === 'ERR_BAD_RESPONSE'
            && err.response.status === 500
            && err.response.data.message === 'Request failed.'
            && (err.response.data.servlet.indexOf('org.glassfish.jersey.servlet.ServletContainer') > -1)
            && err.response.data.status === '500');
    }
    async GetBrokerVersion() {
        return this.QueryPulsarAdminClient(this.client.brokers().version(), "");
    }
    async ListClusterNames() {
        return this.QueryPulsarAdminClient(this.client.clusters().get(), []);
    }
    async GetClusterDetails(clusterName) {
        return this.QueryPulsarAdminClient(this.client.clusters().get_1(clusterName), undefined);
    }
    async ListTenantNames() {
        return this.QueryPulsarAdminClient(this.client.tenants().get(), []);
    }
    async ListNamespaceNames(tenantName) {
        return new Promise((resolve, reject) => {
            this.QueryPulsarAdminClient(this.client.namespaces().getTenant(tenantName), []).then((namespaces) => {
                resolve(namespaces.map((namespace) => { return namespace.split('/').pop(); }));
            }).catch((err) => {
                reject(err);
            });
        });
    }
    async ListTopics(tenantName, namespaceName) {
        return new Promise((resolve, reject) => {
            this.QueryPulsarAdminClient(this.client.namespaces().getTopics(tenantName, namespaceName), []).then((topics) => {
                const topicData = topics.map((topic) => {
                    return new class {
                        constructor() {
                            this.Name = topic.split('//')[1].split('/').pop();
                            this.Type = TTopic_1.TopicType.Persistent;
                        }
                    };
                });
                resolve(topicData);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    async ListConnectorSinkNames(tenantName, namespaceName) {
        return this.QueryPulsarAdminClient(this.client.sinks().list(tenantName, namespaceName), []);
    }
    async ListConnectorSourceNames(tenantName, namespaceName) {
        return this.QueryPulsarAdminClient(this.client.sources().list(tenantName, namespaceName), []);
    }
    async ListFunctionNames(tenantName, namespaceName) {
        return this.QueryPulsarAdminClient(this.client.functions().list(tenantName, namespaceName), []);
    }
}
exports.BaseProvider = BaseProvider;
//# sourceMappingURL=provider.js.map