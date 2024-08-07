import { Typography } from "@mui/material";
import React from "react";

export const allCommunities = [
  // {
  //   id: "ux-research-in-cognitive-psychology-of-Learning",
  //   name: "Cognitive_Psychology",
  //   tags: [
  //     {
  //       title: "Cognitive Psychology",
  //       node: "jTz0wx46dQsbPURkQ0cl",
  //     },
  //     {
  //       title: "Knowledge Visualization",
  //       node: "WgF7yr5q7tJc54apVQSr",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Cognitive_Psychology.jpeg",
  //   title: "UX Research in Cognitive Psychology of Learning",
  //   width: "33%",
  //   leaders: [
  //     {
  //       name: "Iman YeckehZaare",
  //       image: "Iman_YeckehZaare.jpg",
  //       about: `I am a Ph.D. from the University of Michigan School of Information.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/oneweb/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "B6q-LYXvNCg",
  //   description: `We study the UX Research and Cognitive Psychology literature on learning and memorizing. Using 1Cademy, we break down articles into granular knowledge pieces, connect them within a larger context of research, communicate our findings to other community members, and utilize our knowledge to conduct research. We conduct online controlled experiments using our research pipeline and co-author research papers to submit to reputable journals and conferences.`,
  //   accomplishments: (
  //     <div>
  //       <Typography>We have recently published the following papers in ACM conferences:</Typography>
  //       <ul>
  //         <li>
  //           <a>
  //             YeckehZaare, I., Chen, S., & Barghi, T. (2023). Reducing Procrastination Without Sacrificing Students'
  //             Autonomy Through Optional Weekly Presentations of Student-Generated Content. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 54th ACM Technical Symposium on Computer Science Education (SIGCSE 2023), March
  //               15--18, 2023, Toronto, Canada. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3506860.3506907" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Mulligan, V., Ramstad, G. V., &amp; Resnick, P. (2022). Semester-level Spacing but Not
  //             Procrastination Affected Student Exam Performance. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 12th International Conference on Learning Analytics and Knowledge (LAK&#8216;22)
  //               online, March 21-25, 2022. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3478431.3499408" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Grot, G., &amp; Aronoff, C. (2022). Retrieval-based Teaching Incentivizes Spacing and
  //             Improves Grades in Computer Science Education. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 53rd ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE 2022), March
  //               3--5, 2022, Providence, RI, USA. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3478431.3499313" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Grot, G., Dimovski, I., Pollock, K., &amp; Fox, E. (2022). Another Victim of COVID-19:
  //             Computer Science Education. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 53rd ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE 2022), March
  //               3--5, 2022, Providence, RI, USA. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3446871.3469760" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Fox, E., Grot, G., Chen, S., Walkosak, C., Kwon, K., ... &amp; Silverstein, N. (2021,
  //             August). Incentivized Spacing and Gender in Computer Science Education. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 17th ACM Conference on International Computing Education Research
  //             </span>{" "}
  //             (pp. 18-28).
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3313831.3376882" target="_blank" rel="noreferrer">
  //             Yeckehzaare, I., Barghi, T., &amp; Resnick, P. (2020, April). QMaps: Engaging Students in Voluntary
  //             Question Generation and Linking. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 2020 CHI Conference on Human Factors in Computing Systems
  //             </span>{" "}
  //             (pp. 1-14).
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3291279.3339411" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Resnick, P., &amp; Ericson, B. (2019, July). A spaced, interleaved retrieval practice
  //             tool that is motivating and effective. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 2019 ACM Conference on International Computing Education Research
  //             </span>{" "}
  //             (pp. 71-79).
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3287324.3287417" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., &amp; Resnick, P. (2019, February). Speed and Studying: Gendered Pathways to Success. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 50th ACM Technical Symposium on Computer Science Education
  //             </span>{" "}
  //             (pp. 693-698).
  //           </a>
  //         </li>
  //       </ul>
  //     </div>
  //   ),
  //   gains: [
  //     `Work remotely with an interdisciplinary community of talented students and researchers from different schools.`,
  //     `Gain experience using crucial skills in research including paper analysis, summarization, and making connections between disciplines.`,
  //     `Get involved in all aspects of conducting an online controlled experiment under the supervision of Iman YeckehZaare.`,
  //     `Learn about a mixed-method study including both qualitative and quantitative data, and analysis to prepare for future Ph.D. programs in related disciplines.`,
  //     `Work towards publishing research on cognitive psychology of learning and memory in reputable venues.`,
  //     `Have opportunities to take on leadership roles within the community.`,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in psychology, education, or a related field, and answer our quiz questions to evaluate their domain knowledge.`,
  //   // coursera: "https://www.coursera.org/learn/academicinfoseek",
  //   hasTest: true,
  //   qualifications: [
  //     `A strong academic background in topics related to education, learning science, cognitive psychology, memory science, statistics, or econometrics`,
  //     `Fluency in writing and reading in English`,
  //   ],
  //   responsibilities: [
  //     `Dedicate 25 hours a week over the Summer to engage in all aspects of the research project.`,
  //     `Conduct several experiment sessions and guide participants through the session.`,
  //     `Thematically code the qualitative data collected throughout our experiments.`,
  //     `Engage in ideation, critical thinking, and peer-review of research proposed by other community members.`,
  //     `Regularly study textbooks and research papers, summarize them, and share the essence of what you learn with our large research team.`,
  //     `Present the essence of what you learn from the related papers and book chapters in weekly meetings for further discussion.`,
  //     `Co-author the final research paper to submit to reputable conferences/journals.`,
  //   ],
  // },
  {
    id: "clinical-psychology",
    name: "Clinical_Psychology",
    tags: [
      {
        title: "Clinical Psychology",
        node: "2DRAaqsjnWaZ7KL10UKb",
      },
    ],
    allTime: [],
    weekly: [],
    url: "/static/Communities/Clinical_Psychology.jpg",
    title: "Clinical Psychology",
    width: "33%",
    leaders: [
      {
        name: "Liza Shokhrin",
        image: "Liza_Shokhrin.jpeg",
        about: ``,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/elisaveta-liza-shokhrin-0066251bb/",
          },
        ],
      },
    ],
    YouTube: "PvEMhuSuNps",
    description: `The Clinical Psychology community explores research related to mental illness/disorders, mental health treatment, and psychopathology of individuals across the lifespan. Clinical psychology is interdisciplinary and can intersect with various fields such as neuroscience, cognitive psychology, and social psychology. We encourage interns to dive into research that they have particular interest in (e.g., child psychopathology), share their findings, and collaborate with other interns. This internship is designed to motivate independent research, gain research skills such as analysis and interpretation, and work towards conducting research.
    1Cademy allows interns to present their research findings, gain feedback from other interns, and learn how to communicate their findings in a concise and articulate manner.`,
    accomplishments: (
      <Typography>
        `Our community is new. Join our interdisciplinary, transnational group of researchers who have been iteratively
        developing and executing empirical research on the large-scale, online collaborative platform 1Cademy. The goal
        of this research community is to investigate the various areas of clinical psychology and strengthen research
        skills to prepare for a future in the clinical psychology field.`
      </Typography>
    ),
    gains: [
      `Gain valuable research skills and experience, such as paper analysis, summarization, and making connections between disciplines.`,
      `Work towards publishing research on topics related to clinical psychology.`,
      `Collaborate with others to review and summarize existing research and identify topics for further study.`,
      `Work remotely with all interactions, task fulfillment, and communications (about 5-10 hours per week)`,
    ],
    requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in psychology or a related field, and complete a Coursera MOOC and give us access to their certificate.`,
    hasTest: true,
    qualifications: [
      `Interest and enthusiasm for clinical psychology`,
      `Strong desire and willingness to collaborate with others and engage in group discussions.`,
      `Willingness to present work at weekly meetings.`,
      `Able to commit to approximately 5-10 hours of work each week.`,
      `Fluency in writing and reading in English (will have to summarize research articles).`,
    ],
    responsibilities: [
      `Read and summarize textbook chapters and scientific journal articles.`,
      `Make connections between different ideas and concepts.`,
      `Contribute concise summaries of information to the online 1Cademy platform.`,
      `Attend weekly online meetings.`,
      `Contribute in meetings by presenting work and engaging in discussions.`,
      `All interactions, task fulfillment, and communications will be remote.`,
    ],
  },
  // {
  //   id: "health-psychology",
  //   name: "Health_Psychology",
  //   tags: [
  //     {
  //       title: "Psychology",
  //       node: "owiurXq2sPdbHTC3zWHq",
  //     },
  //     {
  //       title: "Health Psychology",
  //       node: "7kScwzjwIaxgBv1RyjVM",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Health_Psychology.png",
  //   title: "Health Psychology",
  //   width: "34%",
  //   leaders: [
  //     {
  //       name: "Isabella Griesmaier",
  //       image: "Isabella_Griesmaier.jpeg",
  //       about: ``,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/isabella-griesmaier-090900",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Carson James Clark",
  //       image: "Carson_James_Clark.jpeg",
  //       about: ``,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/carson-clark-b393b7243/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "3aacjlSdmq4",
  //   description: `The goal of the health psychology community is to inspire the development of key research skills while conducting a review of health psychology literature. Using credible, scholarly articles, we are exploring various topics within the field of health psychology, including: behavioral therapies for mental illness, the intersection of race and gender in the healthcare industry, what motivates people to maintain a healthy lifestyle, and the complex role of the media in health. As we compile our research using 1Cademy, we hope to discover patterns and gaps in the literature that could be addressed in a future study of our own design. Each week, interns read an article, summarize it using 1Cademy, present their findings to the group, and engage in thoughtful discussion about themes present in their article.`,
  //   accomplishments: `We are still in the preliminary stages of our exploration into the current literature in health psychology. Our team has investigated various topics including the many applications of cognitive-behavioral therapy, the emerging problem of climate grief, the effectiveness of telehealth as a psychotherapy alternative, and LGBTQ+ experiences in healthcare. Recently, we have shifted our attention to reorganizing our section of the larger map, creating an easy-to-follow outline of topics in health psychology. Our next steps will be researching articles relating to other general subsections of the field, such as patient-provider relationships, the psychological impact of chronic illnesses, and impacts of nutrition on overall health.`,
  //   gains: [
  //     `Develop key research skills, such as paper analysis, summarization, and making connections between disciplines `,
  //     `Explore recent health psychology literature, with topics including (but not limited to): Behavioral therapies for medical disorders, race and gender in healthcare, mental health, or the psychological component of maintaining a healthy lifestyle. `,
  //     `Experience a flexible and collaborative work environment, with all work being done remotely `,
  //     `Work towards publishing research on health psychology.`,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in health psychology or a related field, and complete a Coursera MOOC and give us access to their certificate.`,
  //   // coursera: "https://www.coursera.org/learn/positive-psychiatry",
  //   hasTest: true,
  //   qualifications: [
  //     `Knowledge and interest in topics related to the field of health psychology `,
  //     `Fluency in reading and writing in English (written summaries of research articles necessary) `,
  //     `Ability to work successfully in a collaborative environment and willingness to present findings to the team each week.`,
  //   ],
  //   responsibilities: [
  //     `Regularly study textbooks and research papers, summarize them, and add notes to the collaborative platform `,
  //     `Must be prepared and excited to collaborate with our team of computer scientists, web developers, UX researchers, UI designers, epidemiologists, and cognitive and behavioral scientists. `,
  //     `Attend weekly meetings and engage in meaningful discussion about the articles presented. `,
  //     `All interactions, task fulfillment, and communications will be remote.`,
  //   ],
  // },
  {
    id: "ai-language-models-in-education",
    name: "AI_Language_Models_in_Education",
    tags: [
      {
        title: "Natural language processing",
        node: "khCWqIXa9xQiojnEqHCT",
      },
    ],
    allTime: [],
    weekly: [],
    url: "/static/Communities/AI_Language Models_in_Education.png",
    title: "AI Language Models in Education",
    width: "33%",
    leaders: [
      {
        name: "Lewis Truong",
        image: "Lewis_Truong.jpg",
        about: ``,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/lewisdadude/",
          },
        ],
      },
      {
        name: "Billy Wang",
        image: "Billy_Wang.jpeg",
        about: `A driven, resilient scholar of the humanities that offers critical, constructive, and creative contributions to the collaborative community. Looking forward to making a difference harnessing the power of my analytical skills, writing prowess, and communicative disposition.`,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/billy-wang-5593a122a/",
          },
        ],
      },
      {
        name: "Jayson Malasig",
        image: "Jayson_Malasig.png",
        about: ``,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/jayson-malasig/",
          },
        ],
      },
    ],
    YouTube: "fylApZlhqoQ",

    description: (
      <>
        As a community of researchers, we aim to explore the applications of AI language models in education. LLMs, also
        known as large language models, are a powerful type of artificial intelligence trained to comprehend massive
        repositories of texts & designed to mimic sophisticated human language patterns. We encourage interns to delve
        into research that applies LLMs in educational settings through interactive learning, personalized tutoring,
        automated grading, etc.
        <br />
        <br />
        After learning how to navigate the 1Cademy platform, researchers should break down complex research articles,
        present them as digestible pieces of information, and communicate their findings with the larger community.
        Ultimately, the internship is designed to encourage independent inquiry, cultivate research skills like
        analyzing and interpreting data, and work towards advancing research.
      </>
    ),
    accomplishments: ``,
    gains: [
      `Work remotely with an interdisciplinary community of talented students and researchers from different schools (5-10 hours per week).`,
      `Gain experience using crucial skills in research including paper analysis, summarization, and making connections between disciplines.`,
      `Collaborate with others to review and summarize existing research and identify topics for further study.`,
      `Work towards publishing research on the application of LLMs in modern education.`,
      `Have opportunities to take on leadership roles within the community.`,
    ],
    requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5 GPA to apply for this position. All majors are welcome to apply. A personal or academic interest in disability is highly preferred, and answer our quiz questions to evaluate their domain knowledge.`,
    hasTest: true,
    qualifications: [
      `An academic background in topics related to STEM. Majors in education, business, humanities, and social sciences, are also encouraged to apply.`,
    ],
    responsibilities: [
      `Read and summarize textbook chapters and scientific journal articles.`,
      `Make connections between different ideas and concepts.`,
      `Contribute concise summaries of information to the online 1Cademy platform.`,
      `Attend weekly online meetings.`,
      `Contribute to meetings by presenting work and engaging in discussions.`,
      `All interactions, task fulfillment, and communications will be remote.`,
    ],
  },
  {
    id: "behavioral-sciences",
    name: "Behavioral_Sciences",
    tags: [
      {
        title: "Behavioral Sciences",
        node: "2rZY0xTyST3agd7HWcfW",
      },
    ],
    allTime: [],
    weekly: [],
    url: "/static/Communities/Behavioral_Sciences.jpg",
    title: "Behavioral Sciences",
    width: "33%",
    leaders: [
      {
        name: "Ariana Furlong",
        image: "Ariana_Furlong.jpeg",
        about: ``,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/ariana-furlong1601/",
          },
        ],
      },
    ],
    YouTube: "NPiKhlS6u9Q",

    description: (
      <>
        The Behavioral Sciences is centered on the interdisciplinary study of organisms and their interactions with the
        world at large, investigating behavioral science topics such as decision-making, addiction, self-esteem, and
        theory of mind. Interns are tasked with investigating behavioral science topics, summarizing research articles,
        collaborating with fellow interns, and presenting their work at weekly meetings.
        <br />
        <br />
        We encourage interns to personalize their research to their specific interests within the field. Interning with
        1Cademy provides interns with the opportunity to gain research skills, such as analytical and investigative
        research skills, helping them gain foundational skills for future research endeavors.
      </>
    ),
    accomplishments: ``,
    gains: [
      `Gain valuable research skills and experience, such as analyzing scientific journals and articles, summarization, and making connections between disciplines`,
      `Publish research on topics on the 1Cademy platform related to behavioral science`,
      `Collaborate with others to review and summarize existing research on behavioral science, and identify topics for further study`,
      `Work in a flexible, remote environment (about 5-10 hours/week)`,
    ],
    requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5 GPA to apply for this position. All majors are welcome to apply. A personal or academic interest in disability is highly preferred, and answer our quiz questions to evaluate their domain knowledge.`,
    hasTest: true,
    qualifications: [
      `Interest and enthusiasm for behavioral science topics`,
      `Desire to collaborate with others, present your work, and discuss behavioral science topics at our weekly meetings`,
      `Fluency in writing and reading in English (will have to summarize research articles)`,
    ],
    responsibilities: [
      `Read and concisely summarize textbook chapters and scientific journal articles about, and relating to, behavioral science`,
      `Identify connections between different ideas and concepts`,
      `Contribute your work to the online 1Cademy platform`,
      `Participate in peer review`,
      `Attend weekly online meetings`,
      `Participate in meetings by presenting work, engaging in discussions, and providing feedback`,
      `All interactions, task fulfillment, and communications will be remote`,
    ],
  },
  {
    id: "disability-studies",
    name: "Disability_Studies",
    tags: [
      {
        title: "Disability Studies",
        node: "Y4HihWopCsKNaVZSr6s0",
      },
    ],
    allTime: [],
    weekly: [],
    url: "/static/Communities/Disability_Studies.jpg",
    title: "Disability Studies",
    width: "33%",
    leaders: [
      {
        name: "Katherine Wells",
        image: "Katherine_Wells.jpeg",
        about: `I am currently an undergraduate student at the University of Virginia pursuing a Bachelor of Arts in Psychology and Sociology`,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/katherine-wells-b0621021a/",
          },
        ],
      },
      {
        name: "Renee Kessler",
        image: "Renee_Kessler.jpeg",
        about: `I graduated with a bachelors of science in psychology with a minor in sociology in the spring of 2022.`,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/renee-kessler-71a247262/",
          },
        ],
      },
    ],
    YouTube: "pWYt3vtPm6U",
    description: `The Disability Studies community explores current and past research topics related to disability such as disability legislation, disability culture, the psychosocial impact of disability, the economics of disability, the interaction of technology and disability, and more. Interns summarize research articles and present their findings weekly with the rest of the group. By using the 1Cademy online network, interns synthesize articles into smaller ideas, connect them to broader concepts both within the disability studies community and other communities on the platform, extrapolate the research for deeper analysis, and communicate their findings to other community members. We value collaborative learning and expect interns to participate in group discussions and leverage collective knowledge to dive deeper into the content.`,
    accomplishments: `We have created a strong foundation of knowledge about a wide variety of topics and how they relate to disability.
    Some of the topics we have explored include:
    different models of disability,
    disability culture,
    the psychological, social, and economic impact of different disabilities,
    academic accommodations for those with disabilities,
    disability legislature,
    cultural and religious beliefs about disability,
    and ableism.
    We have summarized information from numerous research articles and other scholarly sources and we allow interns to find specific topics that interest them, accomplishing a flexible and personally rewarding environment.`,
    gains: [
      `Gain valuable research skills and experience, such as analyzing scientific journals and articles, summarization, and making connections between disciplines.`,
      `Publish research on topics on the 1Cademy platform related to disability.`,
      `Collaborate with others to review and summarize existing research and identify topics for further study.`,
      `Work remotely with all interactions, task fulfillment, and communications (about 5-10 hours per week).`,
    ],
    requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5 GPA to apply for this position. All majors are welcome to apply. A personal or academic interest in disability is highly preferred, and answer our quiz questions to evaluate their domain knowledge.`,
    hasTest: true,
    qualifications: [
      `Interest and enthusiasm for topics related to Disability Studies.`,
      `Strong desire and willingness to collaborate with others and engage in group discussions.`,
      `Willingness to present work at weekly meetings.`,
      `Fluency in writing and reading in English (will have to summarize research articles).`,
    ],
    responsibilities: [
      `Read and condense empirical sources that relate to disabilities.`,
      `Actively contribute information to 1Cademy’s platform with the goal of achieving a unified research resource encompassing many disciplines.`,
      `Frequently revise and improve personal work.`,
      `Attend weekly meetings to present weekly findings and partake in discussions.`,
      {
        title: `Connect with other members within the community`,
        subRes: [`Provide feedback`, `Collaborate on ideas`, `Participate in peer review`],
      },
    ],
  },
  {
    id: "social-psychology",
    name: "Social_Psychology",
    tags: [
      {
        title: "Social psychology",
        node: "FyQoGIdVVeDHvn1lHOZL",
      },
    ],
    allTime: [],
    weekly: [],
    url: "/static/Communities/Social_Political_Psychology.jpg",
    title: "Social Psychology",
    width: "33%",
    leaders: [
      {
        name: "Alex Nikolaidis Konstas",
        image: "Alex_Nikolaidis_Konstas.jpg",
        about: `I am an undergraduate student from Thessaloniki, Greece, and I am in my senior year at Davidson College, NC. Specifically, I am double majoring in Psychology and Studio Art. I joined 1Cademy as an intern for the Educational Psychology research group in the summer of 2021. For the fall semester of 2021, I began interning for the Social/Political Psychology research team. However, I started co-leading the group in November of 2021, as I was very passionate about the interdisciplinary and collaborative approach of the platform. I have conducted research related to social psychology, and I hope to pursue graduate studies in the field. My research interests include social cognition, bias, and gender.`,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/alex-nikolaidis-konstas-3894a7207/",
          },
        ],
      },
      {
        name: "Iman YeckehZaare",
        image: "Iman_YeckehZaare.jpg",
        about: `I am a Ph.D. from the University of Michigan School of Information.`,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/oneweb/",
          },
        ],
      },
    ],
    YouTube: "andaAkbcHCk",
    description: `The Social Psychology community explores published research in the field and conducts relevant studies. Interns are responsible for aiding in the ideation and completion of studies. They also summarize research articles and present their findings with the rest of the group. By using 1Cademy, interns learn how to break down articles into granular and connected concepts to best communicate their findings to other community members. We value collaborative learning and expect interns to participate in group discussions to dive deeper into the content.
    Topics that the community will explore in a research setting include the effects of achievement/effort on performance, ways to increase motivation, and ways to diminish misinformation. While some initial work has been made, interns are welcome to join as soon as possible to receive the necessary training and begin collaborating with us.
    `,
    accomplishments: "",
    gains: [
      `Work remotely with an interdisciplinary community of talented students and researchers from different schools.`,
      `Gain experience in using crucial skills in research including paper analysis, summarization, and making connections between disciplines.`,
      `Get involved in all aspects of conducting online controlled experiments.`,
      `Learn about conducting controlled online experiments to prepare for future Ph.D. programs in related disciplines.`,
      `Work towards publishing research on social/political psychology in reputable venues.`,
      `Have opportunities to take on leadership roles within the community.`,
      `Get involved in all aspects of conducting online controlled experiments.`,
    ],
    requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in disciplines related to behavioral economics or social psychology, and answer our quiz questions to evaluate their domain knowledge.`,
    // coursera: "https://www.coursera.org/learn/academicinfoseek",
    hasTest: true,
    qualifications: [
      `A strong academic background in topics related to social or political psychology`,
      `Fluency in writing and reading in English`,
    ],
    responsibilities: [
      `Dedicate approximately 10-15+ hours a week to engage in all aspects of the research projects.`,
      `Engage in ideation, critical thinking, and peer-review of research proposed by other community members.`,
      `Regularly study textbooks and research papers, summarize them, and share the essence of what you learn with our large research team.`,
      `Present the essence of what you learn from the related papers and book chapters in weekly meetings for further discussion.`,
      `Co-author the final research paper to submit to reputable conferences/journals.`,
    ],
  },
  // {
  //   id: "education-and-psychology-research",
  //   name: "UX_Research_in_Online_Communities",
  //   tags: [
  //     {
  //       title: "Online Communities",
  //       node: "ZyVgzAZOlOXx7d7tWEDx",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Online_Communities.jpg",
  //   title: "Education and Psychology Research",
  //   width: "50%",
  //   leaders: [
  //     {
  //       name: "Iman YeckehZaare",
  //       image: "Iman_YeckehZaare.jpg",
  //       about: `I am a Ph.D. from the University of Michigan School of Information.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/oneweb/",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Ben Brown",
  //       image: "Ben_Brown.jpeg",
  //       about: `I am in my second year studying library and information science at SJSU and I serve as a content editor for my school's Student Research Journal. I have excellent communication skills which include written and verbal communication. I enjoy learning about information searching, organization, and retrieval, and look forward to more opportunities to apply what I have learned so far.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/benjamin-brown-b8b5611a7/",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Lily DiBartolomeo",
  //       image: "Lily_DiBartolomeo.jpeg",
  //       about: ``,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/lily-dibartolomeo/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "MSysfWhNXmg",
  //   description: (
  //     <>
  //       <p>
  //         1Cademy is a collaborative community that supports interdisciplinary research and learning through content
  //         generation, mapping, and evaluation. We have multiple successful communities from various fields collaborating
  //         regularly by summarizing and organizing content on the platform. This community is focused on learning how to
  //         make healthier, more engaged online communities in order to improve our users’ learning, contributions, and
  //         experience.
  //       </p>
  //       This research team is dedicated to uncovering, presenting, and compiling the latest literature and research on
  //       creating and maintaining engaging and beneficial online communities. Our goal is to understand how to foster
  //       online communities where users actively contribute their ideas and value the perspectives of their peers. We are
  //       seeking a team of dedicated students to conduct thorough research in various disciplines including social
  //       science, cognitive science, information science, and education. Utilizing the 1Cademy platform, we will take
  //       notes, organize ideas, and map concepts from the literature we find. Ultimately, our aim is to apply our
  //       findings to make meaningful improvements to the 1Cademy platform and enhance the user experience of our online
  //       communities.
  //       <p></p>
  //     </>
  //   ),

  //   accomplishments: (
  //     <div>
  //       <Typography>We have recently published the following papers in ACM conferences:</Typography>
  //       <ul>
  //         <li>
  //           <a>
  //             YeckehZaare, I., Chen, S., & Barghi, T. (2023). Reducing Procrastination Without Sacrificing Students'
  //             Autonomy Through Optional Weekly Presentations of Student-Generated Content. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 54th ACM Technical Symposium on Computer Science Education (SIGCSE 2023), March
  //               15--18, 2023, Toronto, Canada. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3506860.3506907" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Mulligan, V., Ramstad, G. V., &amp; Resnick, P. (2022). Semester-level Spacing but Not
  //             Procrastination Affected Student Exam Performance. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 12th International Conference on Learning Analytics and Knowledge (LAK&#8216;22)
  //               online, March 21-25, 2022. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3478431.3499408" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Grot, G., &amp; Aronoff, C. (2022). Retrieval-based Teaching Incentivizes Spacing and
  //             Improves Grades in Computer Science Education. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 53rd ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE 2022), March
  //               3--5, 2022, Providence, RI, USA. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3478431.3499313" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Grot, G., Dimovski, I., Pollock, K., &amp; Fox, E. (2022). Another Victim of COVID-19:
  //             Computer Science Education. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 53rd ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE 2022), March
  //               3--5, 2022, Providence, RI, USA. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3446871.3469760" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Fox, E., Grot, G., Chen, S., Walkosak, C., Kwon, K., ... &amp; Silverstein, N. (2021,
  //             August). Incentivized Spacing and Gender in Computer Science Education. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 17th ACM Conference on International Computing Education Research
  //             </span>{" "}
  //             (pp. 18-28).
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3313831.3376882" target="_blank" rel="noreferrer">
  //             Yeckehzaare, I., Barghi, T., &amp; Resnick, P. (2020, April). QMaps: Engaging Students in Voluntary
  //             Question Generation and Linking. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 2020 CHI Conference on Human Factors in Computing Systems
  //             </span>{" "}
  //             (pp. 1-14).
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3291279.3339411" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., Resnick, P., &amp; Ericson, B. (2019, July). A spaced, interleaved retrieval practice
  //             tool that is motivating and effective. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 2019 ACM Conference on International Computing Education Research
  //             </span>{" "}
  //             (pp. 71-79).
  //           </a>
  //         </li>
  //         <li>
  //           <a href="https://dl.acm.org/doi/abs/10.1145/3287324.3287417" target="_blank" rel="noreferrer">
  //             YeckehZaare, I., &amp; Resnick, P. (2019, February). Speed and Studying: Gendered Pathways to Success. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 50th ACM Technical Symposium on Computer Science Education
  //             </span>{" "}
  //             (pp. 693-698).
  //           </a>
  //         </li>
  //       </ul>
  //     </div>
  //   ),
  //   gains: [
  //     `Learn how to use the 1Cademy platform for information management, organization, and dissemination purposes `,
  //     `Collaborate with a team of motivated and invested research interns from around the world`,
  //     `Gain experience evaluating, paraphrasing, and presenting research`,
  //     `Gain experience working in a remote setting and collaborating with a team on academic research`,
  //     `Work toward reviewing and synthesizing literature into original research`,
  //     `Have opportunities to take on leadership roles `,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in psychology, education, or a related field, and answer our quiz questions to evaluate their domain knowledge.`,
  //   // coursera: "https://www.coursera.org/learn/academicinfoseek",
  //   hasTest: true,
  //   qualifications: [
  //     `Enthusiasm for topics related to psychology, information sciences, learning science, education or related fields`,
  //     `Ability to verbally communicate effectively and facilitate team meetings`,
  //     `Experience and willingness to work in collaborative environments `,
  //     `Ability to engage in group discourse and resolve complex issues`,
  //     `Ability to work asynchronously and independently`,
  //     `Strong presentation and summarization skills `,
  //     `Fluency in writing and reading in English`,
  //     `Motivation to read new and upcoming research papers`,
  //   ],
  //   responsibilities: [
  //     `Work asynchronously and attend online meetings once per week. `,
  //     `Contribute 15-20 hours/week of your time to developing the 1Cademy platform`,
  //     `Use the 1Cademy platform to organize knowledge `,
  //     `Work with a team to develop and improve the psychology and education area of 1Cademy `,
  //     `Support research projects by summarizing background literature`,
  //     `Work remotely for all interactions, task fulfillment, and communications `,
  //     `Translate research into ideas to improve the experience of 1Cademy communities`,
  //   ],
  // },
  // {
  //   id: "ADHD-and-autism",
  //   name: "ADHD_and_autism",
  //   tags: [
  //     {
  //       title: "Attention-Deficit Hyperactivity Disorder (ADHD)",
  //       node: "HJq7AEyAXkO3Kp3ft2o7",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/ADHD_and_Autism.jpg",
  //   title: "ADHD and Autism",
  //   width: "50%",
  //   leaders: [
  //     {
  //       name: "Lee Pavelle",
  //       image: "Lee_Pavelle.jpeg",
  //       about: `I am a Ph.D. from the University of Michigan School of Information.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/eleanore-pavelle-73642b199/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "jFBeYsMNbY4",
  //   description: `
  //   The ADHD and Autism research community is centered around researching aspects of neurodivergence including (but by no means limited to) the relationships between ADHD and Autism with things such as OCD, schizoid disorders, physical disabilities, different types of therapy, depression, anxiety, and gender identity. Interns are encouraged to personalize their research to suit their interests surrounding neurodivergence and will have the opportunity to present their findings at our weekly meetings as well as collaborate with other interns. We will also have opportunities to work with other communities such as the Clinical Psychology community and Disabilities Studies community. Working with 1Cademy allows interns to gain valuable research experience, explore various research topics, collaborate with others, and learn how to present their findings in a succinct, articulate manner.
  //   `,
  //   accomplishments: (
  //     <>
  //       This community is new and brimming with potential! Join our interdisciplinary, transnational community of
  //       researchers who have been developing and adding empirical research to the large-scale and collaborative
  //       platform, 1Cademy, to gain research experience on what you want to research. The goal of the ADHD and Autism
  //       research community on 1Cademy is to deepen our understanding of ADHD, Autism Spectrum Disorder, and the many
  //       related conditions that can accompany them while also strengthening research skills and preparing to enter the
  //       professional psychology field.
  //     </>
  //   ),
  //   gains: [
  //     `Gain valuable research experience such as paper summarization, topic organization, paper analysis, and making connections between disciplines/topics`,
  //     "Work towards publishing papers about ADHD and ASD",
  //     "Be able to collaborate with others to review, summarize, and analyze existing research and examine future research topics",
  //     "Work remotely with all task fulfillment, interactions, and communications (about 5-10 hours per week)",
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in psychology, education, or a related field, and answer our quiz questions to evaluate their domain knowledge.`,
  //   // coursera: "https://www.coursera.org/learn/academicinfoseek",
  //   hasTest: true,
  //   qualifications: [
  //     `Strong interest in topics relating to ADHD and ASD`,
  //     `Willingness to contribute to group discussions and present your findings to others during team meetings`,
  //     `Able to commit to around 5-10 hours of work each week`,
  //     `Fluency in reading and writing in English (will have to summarize research articles)`,
  //   ],
  //   responsibilities: [
  //     `Read and summarize textbook chapters and scientific journal articles`,
  //     `Make connections between different concepts and disciplines `,
  //     `Contribute concise summaries of information to the 1Cademy platform`,
  //     `Attend weekly online meetings`,
  //     `Contribute to meetings by presenting findings and participating in group discussions`,
  //     `All interactions, task fulfillment, and communications will be remote`,
  //   ],
  // },
  // {
  //   id: "Graph_Neural_Network",
  //   tags: [
  //     {
  //       title: "Graph Neural Networks (GNNs)",
  //       node: "s59mYbhSxRdWscDBoAaN"
  //     }
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Graph_Neural_Network.jpg",
  //   title: "Graph Neural Networks",
  //   width: "33%",
  //   leaders: [
  //     {
  //       name: "Tian Yan",
  //       image: "Tian_Yan.jpeg",
  //       about: ``,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/tianyan2023/"
  //         }
  //       ]
  //     }
  //   ],
  //   YouTube: "1J8xBUT1C7c",
  //   description: `We are a group of people who are passionate about GNN and eager to learn about the newest developments. In this community, we consistently work on learning, presenting, and communicating the most up-to-date knowledge about GNN, honing our research skills, and conducting frontier research. Every week, each member will be assigned readings on GNN, and each member will summarize their readings in the form of nodes and connections on our platform 1cademy, and present their nodes at our weekly meeting. If the intern is dedicated and has demonstrated good research ability in this process, we'll further invite you to our research team and you will have the opportunity to co-author scientific papers.`,
  //   accomplishments: ``,
  //   gains: [
  //     `You will improve your reading ability of scientific textbooks and papers.`,
  //     `You will also learn how to quickly grasp important ideas in a research paper and describe it to others.`,
  //     `You will improve your research skills by constantly paraphrasing important concepts in graph neural network, making connections between them, and learning most up-to-date progress in this area.`,
  //     `You will improve your communication skills by making weekly presentations of your reading.`,
  //     `You will have the opportunity to co-author research papers under the guidance of senior researchers and scientists.`,
  //     `You can start at any time and all work will be remote, and you will have an valuable internship experience that you can write on your resume.`
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in computer science, statistics, economics, math, or a related field.`,
  //   hasTest: true,
  //   qualifications: [
  //     `Knowledge and interest in deep learning, especially Graph Neural Network.`,
  //     `Proficiency in at least one programming language, such as R, Python, C++, or Java.`,
  //     `Have completed coursework in linear algebra and calculus.`,
  //     `Have experience in deep learning through course work, projects, or internships.`,
  //     `(Prefered) Have demonstrated experience in Graph Neural Network through course work, projects, or internships.`,
  //     `(Prefered) Have past research experience in deep learning, especially Graph Neural Network.`
  //   ],
  //   responsibilities: [
  //     `Finish your assigned weekly reading, and summarize your reading on our platform 1cademy. The book we are currently reading is Graph Representation Learning by William L. Hamilton, and we also read various survey papers on graph neural network. And if you have other reading materials on graph neural network that interest you more, you can also summarize the readings by your choice.`,
  //     `Join our weekly meeting, and present your summarized nodes during meeting. You are also welcome to present any other summarization on graph neural network that interest you.`,
  //     `If you're invited to our research team, you also need to collaborate with other team members and finished your part of research work on time.`,
  //     `All interactions, task fulfillment, and communications will be remote.`
  //   ]
  // },
  // {
  //   id: "Financial_Technology",
  //   tags: [
  //     {
  //       title: "Financial Technology",
  //       node: "s2hC6oeafzTAuEsFc4FC"
  //     }
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Cryptoeconomics.jpg",
  //   title: "Financial Technology",
  //   width: "34%",
  //   leaders: [
  //     {
  //       name: "Xinrong Yao",
  //       image: "Xinrong_Yao.jpeg",
  //       about: ``,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/xinrong-yao-07aa071b1/"
  //         }
  //       ]
  //     }
  //   ],
  //   YouTube: "4p2QeiPVMzw",
  //   description: `Welcome to the Financial Technology and Cryptocurrency Community! Our community predominantly contributes to the areas of fintech, cryptocurrencies, and micro-econometrics on 1Cademy, our collaborative research platform. We dive into the current textbook or research papers in these areas, break them down into granular knowledge pieces in the form of nodes, connect them to the larger context of research, and present our learnings to other community members. We also work on concrete research ideas and co-author research papers to submit to reputable journals and conferences.`,
  //   accomplishments: ``,
  //   gains: [
  //     `Work remotely with an interdisciplinary community of talented students and researchers from different schools.`,
  //     `Gain experience using crucial skills in research including paper analysis, summarization, and making connections between disciplines.`,
  //     `Work towards having the opportunity of co-authoring research papers in the field.`,
  //     `Have opportunities to take on leadership roles within the community.`
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in computer science, statistics, economics, math, or a related field.`,
  //   hasTest: true,
  //   qualifications: [
  //     `Knowledge and enthusiasm for topics related to machine learning, finance, and/or cryptocurrency, displayed through research, projects, or coursework experiences`,
  //     `Proficiency in Python (or R or some other common programming language)`
  //   ],
  //   responsibilities: [
  //     `Consistently study current textbook or research papers, summarize chapters or sections, and share the essence of what you learn with our large research team in a hierarchically organized fashion.`,
  //     `Attend weekly team meetings to discuss the research and present your efforts throughout the week.`,
  //     `Be prepared and excited to collaborate with our other team members from diverse backgrounds.`,
  //     `All interactions, task fulfillment, and communications will be remote.`
  //   ]
  // },
  // {
  //   id: "Responsible_AI",
  //   tags: [
  //     {
  //       title: "Artifical Intelligence",
  //       node: "s2hC6oeafzTAuEsFc4FC"
  //     }
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Responsible_AI.jpg",
  //   title: "Responsible AI",
  //   width: "33%",
  //   leaders: [
  //     {
  //       name: "Lanjing Ye",
  //       image: "Lanjing_Ye.jpeg",
  //       about: ``,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/lanjing-ye-320581232/"
  //         }
  //       ]
  //     }
  //   ],
  //   YouTube: "nq0IehyU76Y",
  //   description: `Welcome to the Responsible AI Team! Our community predominantly contributes to the Artificial Intelligence area on 1Cademy, our collaborative research platform. We will explore the existing literature and contributions already made in the field of Responsible Artificial Intelligence, including a prospect toward what is yet to be reached. We will learn approaches to making AI systems transparent, fair, secure, and inclusive in the research field. Our team members will dive into the Responsible AI textbooks, survey papers, and journals to gain a concrete understanding of the current state and techniques in the field. Team members will present what they've been learning each week by walking us through the nodes they designed during our weekly team meetings. After meeting certain requirements, you will be invited to join our small research group to work on concrete research ideas and projects.`,
  //   accomplishments: ``,
  //   gains: [
  //     `You will spend the majority of the time going through the Responsible AI textbooks, research papers, and journals to deeply learn about the current progress in the field.`,
  //     `You'll gain experience using crucial skills in research (paper analysis, summarization, making connections between disciplines).`,
  //     `Top contributors to our community would have the opportunity to co-author research papers in the field.`,
  //     `Experience a flexible and collaborative work environment, with all work being done remotely.`
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in computer science, statistics, economics, math, or a related field.`,
  //   hasTest: true,
  //   qualifications: [
  //     `Knowledge and enthusiasm for topics related to computer science and responsible AI.`,
  //     `Displayed interest in computer science through university-level coursework.`,
  //     `Proficiency in at least one programming language, such as R, Python, C++, or Java.`,
  //     `(Preferred) Previous research experience, or other relevant involvement.`,
  //     `(Preferred) Background in artificial intelligence.`
  //   ],
  //   responsibilities: [
  //     `Constantly study the previously mentioned textbook, research papers, and journals. Summarize chapters and sections, and share the essence of what you learn with our research team in a hierarchically organized fashion.`,
  //     `Attend two-hour weekly team meetings to discuss the research and present your efforts throughout the week.`,
  //     `Must be prepared and excited to collaborate with our already established team of computer scientists, information scientists, and statisticians.`,
  //     `All interactions, task fulfillment, and communications will be remote. You are expected to fulfill the task assigned promptly.`
  //   ]
  // },
  // {
  //   id: "Computer_Vision",
  //   tags: [
  //     {
  //       title: "Computer Vision",
  //       node: "xwHB94ALORWhaoDLr6yd"
  //     }
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Computer_Vision.jpg",
  //   title: "Computer Vision",
  //   width: "33%",
  //   leaders: [
  //     {
  //       name: "Adam Nik",
  //       image: "Adam_Nik.jpeg",
  //       about: ``,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/adam-nik-7a9436235/"
  //         }
  //       ]
  //     }
  //   ],
  //   YouTube: "dDuYg9in7Bg",
  //   description: `Welcome to the Computer Vision Community! We are a sub-community under the Deep Learning Community here at 1Cademy and work to explore various research topics and ideas in the field of computer vision. As part of the Computer Vision Community, team members will be tasked with reading and learning from various computer vision research papers and textbooks and will present what they learn to the rest of the community. Additionally, as part of the Computer Vision Community at 1Cademy, interns will be invited to join small research groups to work on concrete research ideas.`,
  //   accomplishments: ``,
  //   gains: [
  //     `Develop key research skills, such as paper analysis, summarization, and making connections between disciplines`,
  //     `Explore state-of-the-art computer vision literature and survey papers to gain a concrete understanding of the current state and techniques of the field`,
  //     `Work towards publishing research papers within the field of computer vision`,
  //     `Experience a flexible and collaborative work environment, with all work being done remotely`
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in computer science, statistics, economics, math, or a related field.`,
  //   hasTest: true,
  //   qualifications: [
  //     `Knowledge and enthusiasm for topics related to machine learning and computer vision`,
  //     `Proficiency in Python and background in linear algebra`,
  //     `Displayed interest in machine learning or similar computer science topics through
  //     university-level coursework.`,
  //     `(Preferred) Previous research experience, or other relevant involvement.`
  //   ],
  //   responsibilities: [
  //     `Regularly study textbooks and research papers, summarize them, and add notes to the
  //     1cademy collaborative platform.`,
  //     `Must be prepared and excited to collaborate with our already established team of
  //     computer scientists, information scientists, and statisticians.`,
  //     `Attend two-hour weekly team meetings to discuss the research and present your efforts
  //     throughout the week.`,
  //     `Be flexible and able to meet and work in a small research group once placed.`,
  //     `All interactions, task fulfillment, and communications will be remote.`
  //   ]
  // },
  {
    id: "liaison-librarians",
    name: "Liaison_Librarians",
    tags: [
      {
        title: "Library Science",
        node: "gRRpc1O61kMszcrW07lW",
      },
    ],
    allTime: [],
    weekly: [],
    url: "/LibraryBackground.jpg",
    title: "Liaison Librarians",
    width: "50%",
    leaders: [
      {
        name: "Ben Brown",
        image: "Ben_Brown.jpeg",
        about: `I am in my second year studying library and information science at SJSU and I serve as a content editor for my school's Student Research Journal. I have excellent communication skills which include written and verbal communication. I enjoy learning about information searching, organization, and retrieval, and look forward to more opportunities to apply what I have learned so far.`,
        websites: [
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/benjamin-brown-b8b5611a7/",
          },
        ],
      },
      // {
      //   name: "Gail Grot",
      //   image: "Gail_Grot.jpeg",
      //   about: `I am an information professional with a master's degree in Library & Information Science and bachelor's in Comparative Cultural Studies. I have experience in research, grant writing, and project management as well as excellent written and verbal communication skills, solid data management and search abilities, and a strong desire to learn.`,
      //   websites: [
      //     {
      //       name: "LinkedIn",
      //       url: "https://www.linkedin.com/in/gail-grot-264278219/",
      //     },
      //   ],
      // },
      // {
      //   name: "Grace Victoria Ramstad",
      //   image: "Grace_Victoria_Ramstad.jpeg",
      //   about: `I am a graduate of Georgetown University with a bachelor's degree in Sociology with focuses on Disability Studies and Education. I am currently working in the field of youth development in Stockholm, while working as a Liaison Librarian for 1Cademy. I have experience with program management, research, and administrative support, primarily in the context of higher education.`,
      //   websites: [
      //     {
      //       name: "LinkedIn",
      //       url: "https://www.linkedin.com/in/grace-ramstad-05342099/"
      //     }
      //   ]
      // },
      // {
      //   name: "Sarah B Licht",
      //   image: "Sarah_B_Licht.jpeg",
      //   about: ``,
      //   websites: [
      //     {
      //       name: "LinkedIn",
      //       url: "https://www.linkedin.com/in/sarah-licht-84343316b/"
      //     }
      //   ]
      // },
      // {
      //   name: "Stephanie Sandoval",
      //   image: "Stephanie_Sandoval.jpeg",
      //   about: ``,
      //   websites: [
      //     {
      //       name: "LinkedIn",
      //       url: "https://www.linkedin.com/in/stephsand14/",
      //     },
      //   ],
      // },
      // {
      //   name: "Viktoria Roshchin",
      //   image: "Viktoria_Roshchin.jpeg",
      //   about: `I currently am an undergraduate student attending Arizona State University for a
      //   bachelor&#39;s in English and a minor in Anthropology. I have volunteered for both the Library of
      //   Congress and the Smithsonian, where I transcribed and reviewed transcriptions to improve the
      //   search, access, and discovery of historical and scientific documents. I also ensured these
      //   transcribed documents are complete and accurate. My volunteer work also included digitizing a
      //   variety of material to create accessibility for researchers and the public within a team-based
      //   environment. My passion resides in research and editing. In my free time, I enjoy hiking,
      //   reading, and writing.`,
      //   websites: [
      //     {
      //       name: "LinkedIn",
      //       url: "https://www.linkedin.com/in/viktoria-r-b2a18314b/"
      //     }
      //   ]
      // }
    ],
    YouTube: "-dQOuGeu0IQ",
    description: `The 1Cademy Librarian community supports the information processes of all the communities on the 1Cademy platform. We do this by liaising with the co-leaders and interns from each community to help them develop their area of the map and information literacy skills. This work supports communities across all fields of focus in three ways:
    1) Embedded Liaison: We work directly with other communities and attend meetings to help create, edit, and arrange their content
    2) Asynchronous Support: We review a portion of a community's map during Librarian meetings
    3) Consultations: We give feedback directly to co-leaders of other communities when they attend our weekly meetings
    Through each of these efforts communities receive the support they need to locate, interpret, abstract, disseminate, and organize knowledge clearly, comprehensively, and accurately on the 1Cademy Platform.
    `,
    accomplishments: (
      <Typography>
        We've had the opportunity to learn about the different information processes of scholars across many different
        disciplines, as well as harness the power of cognitive diversity to develop best information practices on the
        1Cademy platform. Out of this collective experience, we have been able to build a comprehensive liaison or
        embedded librarian program that supports communities and academic focuses across the entire platform. Our team
        has worked with more than 10 communities and coleaders to develop their knowledge map based on their subject of
        focus.
      </Typography>
    ),
    gains: [
      `Organize information on an innovative knowledge mapping platform `,
      `Support communities in disseminating content according to their focus`,
      `Give guidance on best practices in knowledge organization and information literacy`,
      `Work with our development team on improving online research/learning `,
      `Collaboratively identify and resolve content gaps on the knowledge map`,
      `Connect with a team of passionate researchers from different fields and schools`,
    ],
    requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. Interns applying for this position should have a passion for helping other's develop their information processes.`,
    qualifications: [
      `Enthusiasm for topics related to information/knowledge building`,
      `Strong information literacy skills`,
      `Fluency in writing and reading in English`,
      `Ability to verbally communicate effectively and moderate team meetings`,
      `Experience and willingness to work in collaborative environments `,
      `Students in the field of Library Science, Information Science, or related disciplines`,
      `Critical thinking and problem-solving skills `,
      `Ability to engage in group discourse to ideate and resolve complex issues`,
      `Motivated to complete tasks asynchronously`,
    ],
    responsibilities: [
      `Use the 1Cademy platform to organize and manage information `,
      `Work with a team to develop and improve the Library Science area of the map `,
      `Support research projects by summarizing background literature`,
      `Support communities in their information abstraction, organization, and dissemination`,
      `Work with a team of UX designers to develop tutorials and guides for platform use`,
      `Develop Information Search Process (ISP) and Information Literacy Instruction (ILI) guides`,
      `Work remotely for all interactions, task fulfillment, and communications `,
      `All interactions, task fulfillment, and communications will be remote.`,
    ],
  },
  // {
  //   id: "Neuroscience",
  //   tags: [
  //     {
  //       title: "Behavioral Neuroscience",
  //       node: "EotqbmSg4XdYq5U5BQCP"
  //     }
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Neuroscience.jpg",
  //   title: "Neuroscience",
  //   width: "33%",
  //   leaders: [
  //     // {
  //     //   name: "Victoria Mulligan",
  //     //   image: "Victoria_Mulligan.jpg",
  //     //   about: `I am working with the Child Development Lab as well as the Neuropsychology, Cognitive, and Clinical Neuroscience Lab. I am analyzing data using SPSS for one project that has been submitted to the EPA conference, and another project which has been submitted to the APA conference. In the NCCN lab, we are in the preliminary stages of conducting a dissertation regarding Long-Haul COVID-19. As part of this project, I am co-authoring a manuscript on mood, anxiety, and cognition in college students. My other responsibilities include conducting literature reviews, recruiting participants, and collecting and analyzing data.`,
  //     //   websites: [
  //     //     {
  //     //       name: "LinkedIn",
  //     //       url: "https://www.linkedin.com/in/victoria-mulligan-275851161/",
  //     //     },
  //     //   ],
  //     // },
  //     {
  //       name: "Amrit Das Pradhan",
  //       image: "Amrit_Das_Pradhan.png",
  //       about: `I am a third-year psychology major at Cal Poly SLO interested in pursuing a career in clinical neuropsychology. I joined 1Cademy in January 2021 as an intern for the Educational Psychology community. I helped create the Neuroscience Community and have been a co-leader since April 2021. Other than working with 1Cademy, I work as a research assistant in three labs: a neurogenesis lab where we study the effect of different factors on the creation of new neurons and neural cells in snakes, a memory lab where we run a multitude of studies related to memory, and a LGBTQ+ and mental health lab, where we examine problems surrounding mental health and the LGBTQ+ community in San Luis Obispo and come up with potential solutions.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/amrit-pradhan-53abb9226/"
  //         }
  //       ]
  //     }
  //   ],
  //   YouTube: "Mj45B59k4fo",
  //   description: `Students, educators, and researchers, join our large-scale interdisciplinary movement to collaboratively develop, visualize, and organize learning and research materials in your field of interest online for improving education. We are an interdisciplinary group of researchers through the University of Michigan who have been iteratively developing an online research and learning community called 1Cademy.`,
  //   accomplishments: `Our community is new. Join our interdisciplinary, transnational group of researchers who have been iteratively developing and executing empirical research on the large-scale, online collaborative platform 1Cademy. The goal of this research community is to investigate the various areas of
  //   behavioral neuroscience
  //   and strengthen research skills to prepare for a future in the neuroscience field.`,
  //   gains: [
  //     `Gain experience using crucial skills in research (literature analysis, summarization, making connections between disciplines) `,
  //     `Develop presentation skills and learn how to give concise descriptions of research and topics in neuroscience. `,
  //     `Analyze literature and research to help contribute to research and education. `,
  //     `Learn concepts and theory in neuroscience `,
  //     `Develop a positive community-wide reputation for your engagement (over 500+ users from various disciplines) which is displayed on our leaderboard. `,
  //     `Be publicly accredited for any work you produce for years to come. `,
  //     `Individual contributions will be available through google search and cite your name (and other search engines)`
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.0/4.0 GPA to apply for this position. Interns are required to have a degree path in neuroscience or a related field, and answer our quiz questions to evaluate their domain knowledge.`,
  //   hasTest: true,
  //   qualifications: [
  //     `Understanding of basic concepts in neuroscience and ability to filter information into digestible chunks. `,
  //     `An enthusiasm to write, visualize, and organize learning and research content and collaborate with different communities from a large spectrum of schools and disciplines. `,
  //     `Curiosity for other types of fields, and a readiness to learn more about them. `,
  //     `Experience and willingness to work in large-scale collaborative environments. `
  //   ],
  //   responsibilities: [
  //     `Taking information from neuroscientific literature to map and hierarchically structure information in a coherent manner.`,
  //     `Give presentations over what you have researched in weekly meetings for further discussion.`,
  //     `Generate ideas for future research in the field and point out areas of missing information or a gap in research.`,
  //     `Actively utilizing 1Cademy to refine and properly structure the information.`,
  //     `Attend and actively participate in weekly meetings for the Neuroscience 1Cademy group.`,
  //     `Regularly communicate and respond to communications with the group through Microsoft Teams.`,
  //     `Expected 5hrs a week minimum to retain the internship.`,
  //     `There will be weekly meetings where interns will present their findings and receive feedback from the group.`,
  //     `All interactions, task fulfillment, and communications will be remote.`
  //   ]
  // }
  // {
  //   id: "Mindfulness",
  //   tags: [
  //     {
  //       title: "Mindfulness",
  //       node: "L6N5EOy8Ij73XoJgy09e",
  //     },
  //     {
  //       title: "Positive Psychology",
  //       node: "v9d4f86mmgaWV7tMLZQM",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Mindfulness.jpg",
  //   title: "Positive Psychology",
  //   width: "34%",
  //   leaders: [
  //     // {
  //     //   name: "Dallas Wilburn",
  //     //   image: "Dallas_Wilburn.jpg",
  //     //   about: `I am a student at the University of Texas at Austin pursuing a Bachelor's of Art in Psychology. I am passionate about increasing mental health awareness and learning the best techniques for treatment of mental illness. I have experience mentoring my peers and have held several leadership positions within and outside of my university. I am dedicated to helping those in my community, whether that be social or academic, and love learning more about psychology in any context.`,
  //     //   websites: [
  //     //     {
  //     //       name: "LinkedIn",
  //     //       url: "https://www.linkedin.com/in/dallas-wilburn-795145228/",
  //     //     },
  //     //   ],
  //     // },
  //     {
  //       name: "Noor Jassim",
  //       image: "Noor_Jassim.jpeg",
  //       about: `Honors student at Eastern Michigan University pursuing a Bachelor of Science in psychology and sociology. A research assistant at the Self-regulation, Early Experience, and Development (SEED) lab in the psychology department. An assistant manager at a real estate company. Active Humane Society volunteer. Adamant enthusiast of quantitative methods in social psychology and medical sociology. Other interests include dialectical behavior therapy (DBT) as well as emotional regulation.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/noor-jassim/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "2tH94sJ18BI",
  //   description: (
  //     <div>
  //       <p>
  //         We are an interdisciplinary group of learners and researchers who have
  //         been iteratively contributing to and improving a large-scale, online
  //         collaborative research platform called 1Cademy. Our platform
  //         facilitates knowledge sharing and remote, collaborative research by
  //         enabling users to organize research in a hierarchical format through
  //         content generation, mapping, and evaluation.
  //       </p>
  //       <p>
  //         The main objective of the Positive Psychology community is to explore
  //         three fundamental lines of inquiry of the discipline which includes
  //         positive subjective experiences, individual traits, and social
  //         institutions. A focus will be on the efficacy of mindfulness practices
  //         within the clinical context. Interns will have the freedom to research
  //         a topic of interest within positive psychology and share their
  //         findings on the collaborative research platform 1Cademy.
  //       </p>
  //       <p>Some of the topics such as the following will be discussed:</p>
  //       <ul>
  //         <li>
  //           Impact of positive experiences such as love, good mood, and
  //           happiness on the wellbeing of individuals and its buffering effect
  //           on psychopathology.
  //         </li>
  //         <li>
  //           The power of social support on individuals and its relation to
  //           psychological nurturement.
  //         </li>
  //         <li>
  //           The 3rd wave of cognitive behavioral therapy (CBT) and its impact in
  //           popularizing mindfulness in western practices.
  //         </li>
  //         <li>
  //           The multitude of ways in which mindfulness can be applied in
  //           clinical practices with individuals that suffer from severe
  //           psychopathology.
  //         </li>
  //         <li>
  //           The functions of mindfulness that leads to mental flexibility,
  //           greater impulse resistance, and decrease in judgmentalness among
  //           individuals.
  //         </li>
  //         <li>
  //           Many other topics of your choosing within positive psychology.
  //         </li>
  //       </ul>
  //     </div>
  //   ),
  //   accomplishments: `We have examined and updated the mindfulness community tag on 1Cademy with cross-disciplinary applications of mindfulness in thorough detail.
  //   We have compiled an inclusive list of mental disorders from the DSM-5 that can benefit from clinical mindfulness as well as documented case studies of certain populations that were able to benefit from mindfulness when it applied to psychopathological symptoms.
  //   We have outlined multiple mindfulness interventions that have been backed by empirical research and heavily tested across the world in multiple research institutions.
  //   Also, we have connected the origins of mindfulness that stemmed from eastern traditions to the current applications of mindfulness in the clinical western setting as well as provided a cohesive snapshot of the roots of mindfulness in ancient eastern religions.`,
  //   gains: [
  //     `Gain experience by developing critical skills in research, including reviewing past literature, analyzing, and synthesizing information in a concise cohesive manner.`,
  //     `Work towards executing and publishing research on a public research platform on positive psychology and mindfulness.`,
  //     `Collaborate with other interns in gaining a deeper understanding of psychology as a science.`,
  //     `Work remotely with all interactions, task fulfillment, and communications.`,
  //     `Completing responsibilities will require a minimum of 5 hours per week. Further research and leadership opportunities become available to those who contribute to the community beyond minimum responsibilities.`,
  //     `Participants may have the opportunity to continue their engagement in this research community after the end of this internship.`,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current cover letter and the most current version of their university transcript, with GPA included on it. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are also required to have elevant experience with research and literature review, Psychology preferred.`,
  //   hasTest: true,
  //   qualifications: [
  //     `A clear understanding of fundamentals of psychology`,
  //     `Interest and enthusiasm for positive psychology and scientific research`,
  //     `Strong desire and willingness to collaborate with others and engage in group discussions`,
  //     `Willingness to attend weekly meetings and present findings`,
  //     `Able to commit to approximately 5-10 hours of work each week`,
  //   ],
  //   responsibilities: [
  //     `Read through textbooks and research papers to develop a synthesized cohesive summary on our knowledge visualization platform 1Cademy.`,
  //     `Attend weekly online meetings.`,
  //     `Contribute in meetings by presenting work and accepting constructive feedback.`,
  //     `Contribute in meetings by engaging in discussion with other interns about research topics.`,
  //   ],
  // },
  // {
  //   id: "Active_Reading_Strategies",
  //   tags: [
  //     {
  //       title: "Cognitive Psychology",
  //       node: "jTz0wx46dQsbPURkQ0cl",
  //     },
  //     {
  //       title: "Knowledge Visualization",
  //       node: "WgF7yr5q7tJc54apVQSr",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Active_Reading_Strategies.png",
  //   title: "Active Reading Strategies Research",
  //   width: "31%",
  //   leaders: [
  //     {
  //       name: "Iman YeckehZaare",
  //       image: "Iman_YeckehZaare.jpg",
  //       about: `I am a Ph.D. from the University of Michigan School of Information.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/oneweb/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "B6q-LYXvNCg",
  //   description: `We study the Active Reading Strategies literature on learning and memorizing. Using 1Cademy, we break down articles into granular knowledge pieces, connect them within a larger context of research, communicate our findings to other community members, and utilize our knowledge to conduct research. We conduct online controlled experiments using our research pipeline and co-author research papers to submit to reputable journals and conferences.`,
  //   accomplishments: (
  //     <div>
  //       <p>
  //         We have recently published the following papers in ACM conferences:
  //       </p>
  //       <ul>
  //         <li>
  //           <a
  //             href="https://dl.acm.org/doi/abs/10.1145/3506860.3506907"
  //             target="_blank"
  //           >
  //             YeckehZaare, I., Mulligan, V., Ramstad, G. V., &amp; Resnick, P.
  //             (2022). Semester-level Spacing but Not Procrastination Affected
  //             Student Exam Performance. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 12th International Conference on Learning
  //               Analytics and Knowledge (LAK&#8216;22) online, March 21-25,
  //               2022. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a
  //             href="https://dl.acm.org/doi/abs/10.1145/3478431.3499408"
  //             target="_blank"
  //           >
  //             YeckehZaare, I., Grot, G., &amp; Aronoff, C. (2022).
  //             Retrieval-based Teaching Incentivizes Spacing and Improves Grades
  //             in Computer Science Education. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 53rd ACM Technical Symposium on Computer
  //               Science Education V. 1 (SIGCSE 2022), March 3--5, 2022,
  //               Providence, RI, USA. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a
  //             href="https://dl.acm.org/doi/abs/10.1145/3478431.3499313"
  //             target="_blank"
  //           >
  //             YeckehZaare, I., Grot, G., Dimovski, I., Pollock, K., &amp; Fox,
  //             E. (2022). Another Victim of COVID-19: Computer Science Education.
  //             In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 53rd ACM Technical Symposium on Computer
  //               Science Education V. 1 (SIGCSE 2022), March 3--5, 2022,
  //               Providence, RI, USA. ACM.
  //             </span>
  //           </a>
  //         </li>
  //         <li>
  //           <a
  //             href="https://dl.acm.org/doi/abs/10.1145/3446871.3469760"
  //             target="_blank"
  //           >
  //             YeckehZaare, I., Fox, E., Grot, G., Chen, S., Walkosak, C., Kwon,
  //             K., ... &amp; Silverstein, N. (2021, August). Incentivized Spacing
  //             and Gender in Computer Science Education. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 17th ACM Conference on International
  //               Computing Education Research
  //             </span>{" "}
  //             (pp. 18-28).
  //           </a>
  //         </li>
  //         <li>
  //           <a
  //             href="https://dl.acm.org/doi/abs/10.1145/3313831.3376882"
  //             target="_blank"
  //           >
  //             Yeckehzaare, I., Barghi, T., &amp; Resnick, P. (2020, April).
  //             QMaps: Engaging Students in Voluntary Question Generation and
  //             Linking. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 2020 CHI Conference on Human Factors in
  //               Computing Systems
  //             </span>{" "}
  //             (pp. 1-14).
  //           </a>
  //         </li>
  //         <li>
  //           <a
  //             href="https://dl.acm.org/doi/abs/10.1145/3291279.3339411"
  //             target="_blank"
  //           >
  //             YeckehZaare, I., Resnick, P., &amp; Ericson, B. (2019, July). A
  //             spaced, interleaved retrieval practice tool that is motivating and
  //             effective. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 2019 ACM Conference on International
  //               Computing Education Research
  //             </span>{" "}
  //             (pp. 71-79).
  //           </a>
  //         </li>
  //         <li>
  //           <a
  //             href="https://dl.acm.org/doi/abs/10.1145/3287324.3287417"
  //             target="_blank"
  //           >
  //             YeckehZaare, I., &amp; Resnick, P. (2019, February). Speed and
  //             Studying: Gendered Pathways to Success. In{" "}
  //             <span style={{ fontStyle: "italic" }}>
  //               Proceedings of the 50th ACM Technical Symposium on Computer
  //               Science Education
  //             </span>{" "}
  //             (pp. 693-698).
  //           </a>
  //         </li>
  //       </ul>
  //     </div>
  //   ),
  //   gains: [
  //     `Work remotely with an interdisciplinary community of talented students and researchers from different schools in the US.`,
  //     `Gain experience using crucial skills in research including paper analysis, summarization, and making connections between disciplines.`,
  //     `Get involved in all aspects of conducting an online controlled experiment.`,
  //     `Learn about a mixed-method study including both qualitative and quantitative data, and analysis to prepare for future Ph.D. programs in related disciplines.`,
  //     `Work towards publishing research on learning science, education, or cognitive psychology of learning and memory in reputable venues.`,
  //     `Have opportunities to take on leadership roles within the community.`,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in psychology, education, or a related field, and answer our quiz questions to evaluate their domain knowledge.`,
  //   // coursera: "https://www.coursera.org/learn/academicinfoseek",
  //   hasTest: true,
  //   qualifications: [
  //     `A strong academic background in topics related to education, learning science, cognitive psychology, memory science, statistics, or econometrics`,
  //     `Fluency in writing and reading in English`,
  //   ],
  //   responsibilities: [
  //     `Dedicate 25 hours a week over the Summer to engage in all aspects of the research project.`,
  //     `Conduct several experiment sessions and guide participants through the session.`,
  //     `Thematically code the qualitative data collected throughout our experiments.`,
  //     `Engage in ideation, critical thinking, and peer-review of research proposed by other community members.`,
  //     `Regularly study textbooks and research papers, summarize them, and share the essence of what you learn with our large research team.`,
  //     `Present the essence of what you learn from the related papers and book chapters in weekly meetings for further discussion.`,
  //     `Co-author the final research paper to submit to reputable conferences/journals.`,
  //   ],
  // },
  // {
  //   id: "Social_Political_Psychology",
  //   tags: [
  //     {
  //       title: "Social psychology",
  //       node: "FyQoGIdVVeDHvn1lHOZL",
  //     },
  //     {
  //       title: "Psychology",
  //       node: "owiurXq2sPdbHTC3zWHq",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Social_Political_Psychology.jpg",
  //   title: "Social/Political Psychology",
  //   width: "37%",
  //   leaders: [
  //     {
  //       name: "Talia Gillespie",
  //       image: "Talia_Gillespie.jpg",
  //       about: `I'm Talia Gillespie and I'm a psychology major at the University of Delaware in my Junior year. I've been working as an intern at 1cademy since May 2021 in the social/political psychology community because I am interested in social psychology and I was drawn to the interdisciplinary and collaborative nature of 1cademy. I started co-leading the team in August of 2021 and I have loved getting to be even more involved with the community. In my community we have been focusing on misinformation, including the conditions under which it spreads and how to reduce the problem of misinformation through prevention and intervention. Social psychology is my primary interest, and my other research interests include multilingualism and development.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/talia-gillespie-932525214/",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Alex Nikolaidis Konstas",
  //       image: "Alex_Nikolaidis_Konstas.jpg",
  //       about: `I am an undergraduate student from Thessaloniki, Greece, and I am in my senior year at Davidson College, NC. Specifically, I am double majoring in Psychology and Studio Art. I joined 1Cademy as an intern for the Educational Psychology research group in the summer of 2021. For the fall semester of 2021, I began interning for the Social/Political Psychology research team. However, I started co-leading the group in November of 2021, as I was very passionate about the interdisciplinary and collaborative approach of the platform. I have conducted research related to social psychology, and I hope to pursue graduate studies in the field. My research interests include social cognition, bias, and gender.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/alex-nikolaidis-konstas-3894a7207/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "ImoaKx7uoII",
  //   description: `The Social & Political Psychology community explores past research that investigates how misinformation is spread, why it is accepted, and how it can be reduced. Interns summarize research articles and present their findings with the rest of the group. By using 1Cademy, interns learn how to break down articles into granular and connected concepts to best communicate their findings to other community members. We value collaborative learning and expect interns to participate in group discussions to dive deeper into the content.`,
  //   accomplishments: `We have explored topics such as:
  //   demographics,
  //   interventions,
  //   the conditions that make people more susceptible to misinformation,
  //   the effect of misinformation on behavior,
  //   cultural influences on misinformation.
  //   We have summarized information from The Psychology of Fake News, and continued on to explore independent research articles. We allow interns to find specific topics that interest them and explore that area, accomplishing a flexible and personally rewarding environment.`,
  //   gains: [
  //     `Gain experience using crucial skills in research (paper analysis, summarization, making connections between disciplines) `,
  //     `Work towards publishing research on the social and political psychology of misinformation.`,
  //     `Work remotely with all interactions, task fulfillment, and communications`,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in psychology or a related field, and answer our quiz questions.`,
  //   hasTest: true,
  //   qualifications: [
  //     `Knowledge and enthusiasm for topics related to the field of social and political psychology. `,
  //     `Fluency in writing and reading in English (will have to summarize research articles).`,
  //     `Experience and willingness to work in collaborative environments. `,
  //   ],
  //   responsibilities: [
  //     `Excited to collaborate and publish research on the topic. `,
  //     `Constantly study textbooks and research papers, summarize them, and share the essence of what you learn with our large research team `,
  //     `Must be prepared and excited to collaborate with our team of computer scientists, web developers, UX researchers, UI designers, epidemiologists, and cognitive and behavioral scientists. `,
  //     `Presenting the essence of what you learn in weekly meetings for further discussion. `,
  //     `All interactions, task fulfillment, and communications will be remote.`,
  //   ],
  // },
  // {
  //   id: "Cryptoeconomics",
  //   tags: [
  //     {
  //       title: "Cryptoeconomics",
  //       node: "SAbEQzSxChSJWnpiSAmX",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Cryptoeconomics.jpg",
  //   title: "Cryptoeconomics",
  //   width: "35%",
  //   leaders: [
  //     {
  //       name: "Isaac F Maruyama",
  //       image: "Isaac_F_Maruyama.jpeg",
  //       about: `I'm a sophomore studying political science and economics at the University of Minnesota. I started working with 1Cademy's Interdisciplinary Community in the summer of 2021, and founded the Cryptoeconomics Community in the fall of 2021. I'm particularly interested in the ways in which different countries regulate their economies, and how those strategies can be used to minimize inequality and maximize social welfare. Outside of 1Cademy, I'm currently interning for Minnesota Senator Steve Cwodzinski, and I'm also the history reporter for Radio K's Real College Podcast. In my spare time, I love to run, cross-country ski, and play the piano, guitar, and mandolin.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/isaac-maruyama-0273a91b7/",
  //         },
  //       ],
  //     },
  //     // {
  //     //   name: "Daniel Li",
  //     //   image: "Daniel_Li.jpeg",
  //     //   about: `I am junior at NYU Stern concentrating in quantitative economics. I have experience working at startups and in financial roles. I'm interested in a career in investing in venture and growth companies. I also like analyzing data and have experience with Python and R.`,
  //     //   websites: [
  //     //     {
  //     //       name: "LinkedIn",
  //     //       url: "https://www.linkedin.com/in/daniel-x-li/",
  //     //     },
  //     //   ],
  //     // },
  //   ],
  //   YouTube: "RBIRquj1dD8",
  //   description: (
  //     <div>
  //       <p>
  //         The goal of the Cryptoeconomics Research Community is to conduct
  //         detailed and comprehensive research on the various applications of
  //         blockchain technology, as well as the underlying mechanisms that
  //         enable decentralized marketplaces and applications to function.
  //         Through 1Cademy, we aim to create and continuously improve upon a
  //         comprehensive map of cryptoeconomics knowledge, resulting in an ideal
  //         resource for learning about blockchain, cryptocurrencies, and their
  //         usage.
  //       </p>
  //       <p>
  //         This position is a great opportunity for anyone desiring individual
  //         research experience with a flexible schedule and the opportunity for
  //         networking with others in your field. You will have the ability to
  //         develop and improve your research skills through highly collaborative
  //         group work and intercollegial/interdisciplinary interaction. While a
  //         basic familiarity with blockchain technology and academic research is
  //         preferred, anyone with a desire to learn more about the field of
  //         cryptoeconomics and solid writing skills is qualified for the
  //         position.
  //       </p>
  //       <p>
  //         While this position is unpaid, we are very willing to work with your
  //         academic institution so that you may receive some form of credit for
  //         this internship. For anyone interested in pursuing their own
  //         cryptoeconomics research in the future, this position is a great
  //         opportunity to explore different areas in the field and gain a greater
  //         familiarity with the existing academic literature. We strive to
  //         provide interns with the skills and support they need to conduct
  //         quality research independently in an area of their interest.
  //       </p>
  //     </div>
  //   ),
  //   accomplishments: `We have covered a wide range of topics, from the mechanisms than enable individual cryptocurrencies to function, to the macroeconomic impacts of blockchain technology on different nations across the world. We have summarized information from multiple cryptocurrency whitepapers, as well as academic studies on the usage of blockchain in areas including health, music, international transfers, and global criminal activity. We allow individual interns to explore topics of their own interest, and collaborate with other interns to best utilize their talents and passions.`,
  //   gains: [
  //     `Gain experience by developing important skills in research, including paper analysis, summary, and presentation.`,
  //     `Collaborate with other interns to summarize existing research and brainstorm new research ideas.`,
  //     `Have a flexible schedule and work remotely with all interactions, task fulfillment, and communications.`,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts. We prefer our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. We need individuals who are interested in gaining experience with collaborative research and expanding the body of knowledge on Cryptoeconomics.`,
  //   hasTest: true,
  //   qualifications: [
  //     `Interest and enthusiasm for topics related to blockchain, decentralized networks, economics, and political economy.`,
  //     `Willingness to present work and engage in group discussions about research topics.`,
  //     `Fluency in writing and reading in English (will have to summarize research articles).`,
  //     `Must be able to attend weekly meetings on Thursdays from 8:30-9:30PM EST.`,
  //   ],
  //   responsibilities: [
  //     `Read through textbooks and research papers, summarize content on our knowledge visualization platform, 1Cademy, and publicly share summaries with the research team.`,
  //     `Contribute in meetings by engaging in discussion with other interns about research topics.`,
  //   ],
  // },
  // {
  //   id: "Graphic_Design",
  //   tags: [
  //     {
  //       title: "Graphic Design",
  //       node: "oLmj9pmrh2wtR0tPTnpb",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/Graphic_Design.jpg",
  //   title: "Graphic Design",
  //   width: "25%",
  //   leaders: [
  //     {
  //       name: "Samantha Wanamaker",
  //       image: "Samantha_Wanamaker.jpg",
  //       about: `I began my journey with an interest in healthcare and education, working with children with autism. During this time I developed skills on how to best present information and translate my thoughts in a way that will be understood by the children I taught, especially the non-verbal students. I transitioned to UX because I wanted to engage my creative side while leverage my skills in psychology and my desire to help people. I have always been curious about what makes people tick and I bring this curiosity with me in my work. Creating products through user research and brainstorming solutions is exciting and I love seeing a project come together.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/sswanamaker/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "FjgYobJ-W4A",
  //   description: `The Graphic Design Team fills in the role of both graphic design and user interface design. We work in conjunction with the UX Team to create a consistent style throughout 1Cademy. This is a collaborative community where we share ideas, feedback, and critique so that we can better hone our skills to help the growth of 1Cademy. Interns are expected to participate in group meetings by showcasing current progress or deliverables and commenting on other interns' presentations. Design decisions must be supported by evidence.`,
  //   accomplishments: `So far, we have recorded and took note of current design of 1Cademy and highlighted areas that needed improvements or change; created typographical hierarchies for new typefaces; created guide sheet for new icons; updating current 1Cademy informational video; began research on accessible colors; began transitioning components to the new Material Design 3.`,
  //   gains: [
  //     `All communications, task completion, and team activities will be online. `,
  //     `Participants will work in a team-led environment under the leadership of Iman Yeckehzaare, a Ph.D. candidate at the School of Information, and will regularly report their accomplishments in weekly online team meetings.`,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to carefully study Google's Material Design documentation and submit their most current resume, unofficial transcript, and online portfolio.`,
  //   portfolio: true,
  //   hasTest: true,
  //   qualifications: [
  //     `Experience with creating online style guidelines, images and graphics using design software (e.g., Adobe Illustrator, Adobe Photoshop, Adobe After Effects and Adobe Premier and Figma. `,
  //     `Strong understanding of the principles of UX, web information architecture, graphic design, web design, branding, composition, and typography.`,
  //     `Experience with conceptualization, wireframing, and presenting your designs for online platforms.  `,
  //     `Experience working in an agile development process. `,
  //     `Excellent skills to solve problems creatively and effectively. `,
  //     `Keep up with the latest design trends and technologies. `,
  //   ],
  //   responsibilities: [
  //     `Conceptualizing consistent visuals based on requirements and amend designs after feedback. `,
  //     `Creating graphic design guidelines to maintain consistency. `,
  //     `Collaborating with user experience researchers and user interface designers to create visuals for the platform, including graphics and banners. `,
  //     `Regularly updating visuals as the web app evolves. `,
  //     `Ensure final visuals and layouts are visually appealing and on-brand. `,
  //     `Ability to work methodically and meet deadlines.`,
  //     `All interactions, task fulfillment, and communications will be remote.`,
  //   ],
  // },
  //   id: "UX_Research",
  //   tags: [
  //     {
  //       title: "User experience (UX) research",
  //       node: "0OcDwfPChQuXFRnNCH9G",
  //     },
  //     {
  //       title: "Knowledge Visualization",
  //       node: "WgF7yr5q7tJc54apVQSr",
  //     },
  //   ],
  //   allTime: [],
  //   weekly: [],
  //   url: "/static/Communities/UX_Research.jpg",
  //   title: "UX Research",
  //   width: "40%",
  //   leaders: [
  //     {
  //       name: "Catherine Grillo",
  //       image: "Catherine_Grillo.jpeg",
  //       about: `I am a senior studying Information Science in the School of Information at the University of Michigan. My interest in human-computer interaction and creating digital solutions for users in different online communities inspired me to pursue this major. I also have a strong interest in the intersection of psychology and technology that has led me to secure a research position with the goal of improving commitment and decreasing turnover in online communities. My research has not only supported my interests but it has taught me how I can apply my skills and education to improve the experience and functionality of online communities for businesses and organizations. I thrive in a collaborative environment and this research team has given me the necessary communication and leadership skills. I am passionate about user research, understanding user needs, and finding solutions to users' pain points. I would love to be part of an organization that is looking to create a better user experience.`,
  //       websites: [
  //         {
  //           name: "LinkedIn",
  //           url: "https://www.linkedin.com/in/catherine-grillo-491717181/",
  //         },
  //       ],
  //     },
  //   ],
  //   YouTube: "tAKMwhguTHc",
  //   description: `The UX Research team's goal is to conduct research and develop insights that will improve the user experience of 1Cademy. We dive into UX literature and complete literature reviews using the platform to present to the team what we have learned. Another goal of the UX Research team is to collaborate on and submit papers to various academic conferences. Currently, many members of the team are collaborating on a paper and conducting a study. We also work with the UI design team to help them conduct research on design ideas and make informed decisions.`,
  //   accomplishments: `The UX Research team has conducted 1Cademy user research that led to a new and improved onboarding experience for new interns, improved existing documentation, and led to the creation of tutorial videos. Members of the team have learned about many different research methods, from card sorting to affinity mapping, to ethnographic research. The team has also been working on a study and writing a paper, and the members working on this have learned so much about collaboration, learning, and proper ethics and research techniques. We are excited for new opportunities when we begin working with the UI design team to help improve 1Cademy's design.`,
  //   gains: [
  //     `Gain experience in various research methodologies including literature reviews, user interviews, usability testing, and affinity mapping`,
  //     `Have opportunities to take on leadership positions within the team`,
  //     `Gain experience collaborating with an interdisciplinary group of people`,
  //     `Gain experience in presenting literature reviews and findings to a team`,
  //     `Make a meaningful contribution to projects that will improve the usability of a collaborative learning platform`,
  //     `Learn about various theories and contribute to novel research within the UX Research field`,
  //   ],
  //   requirements: `In addition to the 1Cademy general application process, we require our interns to submit both their most current resume and unofficial transcripts, with GPA included on those transcripts. We require our interns to have a minimum of a 3.5/4.0 GPA to apply for this position. Interns are required to have a degree path in information science, psychology, or a related field.`,
  //   hasTest: true,
  //   qualifications: [
  //     `Self-starter with a passion for improving user experience`,
  //     `Strong interest in the user experience field`,
  //     `Experience and willingness to work in collaborative environments (need to share your opinion as well as listen to others)`,
  //     `Some knowledge of different user research methods`,
  //     `Some knowledge of qualitative/quantitative research`,
  //     `Ability to synthesize information from literature to report to group members`,
  //   ],
  //   responsibilities: [
  //     `Work towards a UX research paper to be submitted to ACM conferences`,
  //     `Regularly collaborate with team members on projects that will improve 1Cademy`,
  //     `Gather knowledge from books and papers regarding the best UX practices, summarize important ideas you find, and use 1Cademy to present these findings with the team in weekly meetings. This is how our team finds new projects to work on so we can iteratively improve the usability of 1Cademy.`,
  //     `Attend and actively participate in all-team meetings twice a week`,
  //     `Regularly communicate with team using Microsoft Teams`,
  //     `All interactions, task fulfillment, and communications will be remote.`,
  //   ],
  // },
];
