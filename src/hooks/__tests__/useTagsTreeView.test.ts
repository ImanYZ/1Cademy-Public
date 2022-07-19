// import { AllTagsTreeView } from "../../components/TagsExploratorySearcher";
// import { Tag } from "../../knowledgeTypes";
// import { applyTagAdd } from "../useTagsTreeView";

// describe('should test method from useTagsTreeView hook', () => {
//     it('should test when add tags', () => {

//         const allTags: AllTagsTreeView = {
//             '0EUHGbPx1jCCojgUSOIx': {
//                 "title": "Memory Units (LSTMs) RNNs",
//                 "checked": false,
//                 "nodeId": "0EUHGbPx1jCCojgUSOIx",
//                 "tagIds": [
//                     "FJfzAX7zbgQS8jU5XcEk"
//                 ],
//                 "tags": [
//                     "Data Science"
//                 ],
//                 "children": []
//             },
//             '0GhetzOtnb4sPGmnnbkL': {
//                 "title": "Naive Bayes Classifier Types",
//                 "checked": false,
//                 "nodeId": "0GhetzOtnb4sPGmnnbkL",
//                 "tagIds": [
//                     "FJfzAX7zbgQS8jU5XcEk"
//                 ],
//                 "tags": [
//                     "Data Science"
//                 ],
//                 "children": []
//             },
//             'FJfzAX7zbgQS8jU5XcEk': {
//                 "nodeId": "FJfzAX7zbgQS8jU5XcEk",
//                 "title": "Data Science",
//                 "checked": false,
//                 "tags": [],
//                 "tagIds": [],
//                 "children": [
//                     "0EUHGbPx1jCCojgUSOIx",
//                     "0GhetzOtnb4sPGmnnbkL",
//                 ]
//             }
//         }

//         const tagData: Tag = {
//             createdAt: '',
//             node: 'Fd7sDmHO9YIJdWGQMZqk',
//             tagIds: [],
//             tags: [],
//             title: 'temporal tag',
//             updatedAt: ''
//         }

//         const newAllTags = applyTagAdd(allTags, 'Fd7sDmHO9YIJdWGQMZqk', tagData)

//         expect('Fd7sDmHO9YIJdWGQMZqk' in newAllTags).toBe(true)
//     });
// });
