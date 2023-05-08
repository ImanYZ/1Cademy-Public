import { parseJSONMarkdownObjectsFromResponse } from "src/utils/assistant-helpers";

describe("parseJSONMarkdownObjectsFromResponse", () => {
  describe("Should be able to parse list of json node objects in format of markdown", () => {
    it("without actual markdown list item markup", async () => {
      const content = {
        message:
          'Based on the information found in 1Cademy, we can understand the triple-quoted text as follows:\n\nThe text is comparing the living conditions of people in India today with those from seven centuries ago. It states that people in India today have better access to food, medical care, shelter, and other necessities of life compared to the past. However, when compared to global standards, most people in India are still considered poor.\n\nOne relevant node from 1Cademy is "Post-Colonial India Progress," which explains that after the end of British rule in 1947, India has made significant progress in improving living conditions. For example, life expectancy increased from 27 years to 65 years within half a century.\n\nTo provide a more comprehensive understanding, I suggest exploring the following node from 1Cademy:\n\n{"title": "Post-Colonial India Progress", "type": "Concept"}\n{"title": "Post-Colonial India Progress", "type": "Concept"}',
      };
      const nodes = parseJSONMarkdownObjectsFromResponse(content.message);
      expect(nodes.length).toEqual(2);
      expect(nodes[0].title).toEqual("Post-Colonial India Progress");
      expect(nodes[1].title).toEqual("Post-Colonial India Progress");
    });

    it("with actual markdown list item markup and have explanation before json object list", async () => {
      const content = {
        message:
          'Based on the information found in 1Cademy, we can understand the triple-quoted text as follows:\n\nThe text is comparing the living conditions of people in India today with those from seven centuries ago. It states that people in India today have better access to food, medical care, shelter, and other necessities of life compared to the past. However, when compared to global standards, most people in India are still considered poor.\n\nOne relevant node from 1Cademy is "Post-Colonial India Progress," which explains that after the end of British rule in 1947, India has made significant progress in improving living conditions. For example, life expectancy increased from 27 years to 65 years within half a century.\n\nTo provide a more comprehensive understanding, I suggest exploring the following node from 1Cademy:\n\n- {"title": "Post-Colonial India Progress", "type": "Concept"}\n- {"title": "Post-Colonial India Progress", "type": "Concept"}',
      };
      const nodes = parseJSONMarkdownObjectsFromResponse(content.message);
      expect(nodes.length).toEqual(2);
      expect(nodes[0].title).toEqual("Post-Colonial India Progress");
      expect(nodes[1].title).toEqual("Post-Colonial India Progress");
    });

    it("with actual markdown list item markup and not have explanation before json object list", async () => {
      const content = {
        message:
          'Based on the information found in 1Cademy, we can understand the triple-quoted text as follows:\n\nThe text is comparing the living conditions of people in India today with those from seven centuries ago. It states that people in India today have better access to food, medical care, shelter, and other necessities of life compared to the past. However, when compared to global standards, most people in India are still considered poor.\n\nOne relevant node from 1Cademy is "Post-Colonial India Progress," which explains that after the end of British rule in 1947, India has made significant progress in improving living conditions. For example, life expectancy increased from 27 years to 65 years within half a century.\n\n- {"title": "Post-Colonial India Progress", "type": "Concept"}\n- {"title": "Post-Colonial India Progress", "type": "Concept"}',
      };
      const nodes = parseJSONMarkdownObjectsFromResponse(content.message);
      expect(nodes.length).toEqual(2);
      expect(nodes[0].title).toEqual("Post-Colonial India Progress");
      expect(nodes[1].title).toEqual("Post-Colonial India Progress");
    });
  });
});
