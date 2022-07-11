"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortTypeWindowOption = exports.TimeWindowOption = exports.NodeType = void 0;
var NodeType;
(function (NodeType) {
    NodeType["Relation"] = "Relation";
    NodeType["Concept"] = "Concept";
    NodeType["Code"] = "Code";
    NodeType["Reference"] = "Reference";
    NodeType["Idea"] = "Idea";
    NodeType["Question"] = "Question";
    NodeType["Profile"] = "Profile";
    NodeType["Sequel"] = "Sequel";
    NodeType["Advertisement"] = "Advertisement";
    NodeType["News"] = "News";
    NodeType["Private"] = "Private";
    NodeType["Tag"] = "Tag";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
var TimeWindowOption;
(function (TimeWindowOption) {
    TimeWindowOption["AnyTime"] = "Any Time";
    TimeWindowOption["ThisWeek"] = "This Week";
    TimeWindowOption["ThisMonth"] = "This Month";
    TimeWindowOption["ThisYear"] = "This Year";
})(TimeWindowOption = exports.TimeWindowOption || (exports.TimeWindowOption = {}));
var SortTypeWindowOption;
(function (SortTypeWindowOption) {
    SortTypeWindowOption["MOST_RECENT"] = "MOST_RECENT";
    SortTypeWindowOption["UPVOTES_DOWNVOTES"] = "UPVOTES_DOWNVOTES";
    SortTypeWindowOption["NONE"] = "NONE";
})(SortTypeWindowOption = exports.SortTypeWindowOption || (exports.SortTypeWindowOption = {}));
