import { TMechanisms } from "../home/sections/Mechanism";

export const ASSISTANT_MECHANISMS: TMechanisms[] = [
  {
    id: "planning",
    title: "Planning",
    description:
      "The 1Cademy AI Assistant is a comprehensive scheduling tool that seamlessly integrates with your Google Calendar to optimize and automate the management of your tasks, meetings, and events. It is constantly aware of your changing schedule, adapts to changes in time and priority, and integrates with your Learning Management Systems to automatically schedule course-related deadlines and activities. It uses the Pomodoro technique to break down your study, practice, work, and exercise sessions into manageable blocks with brief breaks to improve your productivity and efficiency. Additionally, it employs scientifically proven cognitive psychology techniques such as Spacing and Interleaving to enhance your long-term learning and retention. With 1Cademy AI Assistant, you can improve your time management, stay on top of your tasks, and boost your learning outcomes, all in one convenient location. The assistant prioritizes your tasks and meetings based on your defined deadlines and priorities, and uses a color-coding system to help you quickly assess your progress and manage your time effectively.",
    animation: {
      src: "rive-assistant/assistant-1.riv",
      artboard: "artboard-1",
    },
  },
  {
    id: "meetings",
    title: "Meetings",
    description: `The 1Cademy AI Assistant is aware of your dynamically changing schedule. When scheduling a one-to-one or group meeting, you simply provide the contact information of the individuals you wish to meet with. The assistant automatically contacts them, and requests that they specify their preferred time slots on a visual calendar of your availabilities, without disclosing any of your tasks or events to them. The assistant also sends reminders to the invitees in case they miss the original invitation. Once the invitees have specified their availabilities, the assistant identifies the most suitable time slots that work for the majority, sets it in your calendar, and sends out Google Calendar invitations to all the attendees. Furthermore, for both one-time and recurring meetings, the assistant can schedule a Google Meet or Zoom call based on your preference. Additionally, the assistant can attend the meeting, transcribe the conversation, and send out a report of the main topics discussed and the results of brainstorming to all the participants after the meeting.`,
    animation: {
      src: "rive-assistant/assistant-2.riv",
      artboard: "artboard-2",
    },
  },
  {
    id: "goals",
    title: "Goals",
    description: `The 1Cademy AI heroCanvasDimensionsAssistant is designed to help you make steady progress towards your goals and objectives, both personal and academic. It utilizes a unique point system to motivate you to form beneficial habits and recognize how these habits can improve your life. The assistant rewards you with badges for completing tasks and maintaining good habits, which serves as a visual representation of your progress. Additionally, it tracks your progress towards each goal, and provides you with personalized feedback and guidance to help you focus on areas where you need improvement and to remind you of your strengths. This way, the assistant helps you achieve a more balanced and well-rounded life, where you excel in all aspects.`,
    animation: {
      src: "rive-assistant/assistant-3.riv",
      artboard: "artboard-3",
    },
  },
];
