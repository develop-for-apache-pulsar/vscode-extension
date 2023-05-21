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
exports.TreeExplorerController = void 0;
const explorer_1 = require("../providers/pulsarClusterTreeDataProvider/explorer");
const traceDecorator_1 = require("../utils/traceDecorator");
class TreeExplorerController {
    static refreshTreeProvider(treeProvider) {
        treeProvider.refresh();
    }
}
__decorate([
    (0, traceDecorator_1.trace)('Refresh Tree Provider'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [explorer_1.PulsarClusterTreeDataProvider]),
    __metadata("design:returntype", void 0)
], TreeExplorerController, "refreshTreeProvider", null);
exports.TreeExplorerController = TreeExplorerController;
