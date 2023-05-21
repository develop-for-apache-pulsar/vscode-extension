"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
const TTopic_1 = require("../../types/TTopic");
const pulsar_admin_1 = require("@apache-pulsar/pulsar-admin");
const traceDecorator_1 = require("../../utils/traceDecorator");
class BaseProvider {
    constructor(webServiceUrl, pulsarToken) {
        if (webServiceUrl === null || webServiceUrl === undefined) {
            throw new Error("Web service url is required");
        }
        if (pulsarToken === undefined) {
            this.client = pulsar_admin_1.default.builder()
                .serviceHttpUrl(webServiceUrl)
                .build();
        }
        else {
            this.client = pulsar_admin_1.default.builder()
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
                    console.debug("Request rejected");
                    console.error(err);
                    reject(err);
                    return;
                }
                console.debug("Request not rejected, returning default value");
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
__decorate([
    (0, traceDecorator_1.trace)('Base: Get broker version'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "GetBrokerVersion", null);
__decorate([
    (0, traceDecorator_1.trace)('Base: List cluster names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "ListClusterNames", null);
__decorate([
    (0, traceDecorator_1.trace)('Base: Get cluster details'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "GetClusterDetails", null);
__decorate([
    (0, traceDecorator_1.trace)('Base: List tenant names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "ListTenantNames", null);
__decorate([
    (0, traceDecorator_1.trace)('Base: List namespace names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "ListNamespaceNames", null);
__decorate([
    (0, traceDecorator_1.trace)('Base: List topics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "ListTopics", null);
__decorate([
    (0, traceDecorator_1.trace)('Base: List connector sink names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "ListConnectorSinkNames", null);
__decorate([
    (0, traceDecorator_1.trace)('Base: List connector source names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "ListConnectorSourceNames", null);
__decorate([
    (0, traceDecorator_1.trace)('Base: List function names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BaseProvider.prototype, "ListFunctionNames", null);
exports.BaseProvider = BaseProvider;
