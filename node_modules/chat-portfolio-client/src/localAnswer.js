import { content, label } from './i18n.js';

const RECOMMENDATION_TOPICS = [
  {
    question: /ออกแบบ|หน้าบ้าน|หน้าเว็บ|\bui\b|\bux\b|design|figma|frontend|front-end/i,
    member: /ui\s*\/\s*ux|designer|design|figma|frontend|front-end|ออกแบบ|html\s*\/\s*css/i,
  },
  {
    question: /หลังบ้าน|backend|back-end|\bapi\b|server|express|node\.?js/i,
    member: /backend|back-end|\bapi\b|server|express|node\.?js/i,
  },
  {
    question: /เอไอ|ปัญญาประดิษฐ์|\bai\b|prompt|machine learning/i,
    member: /\bai\b|prompt|machine learning|claude/i,
  },
  {
    question: /ฐานข้อมูล|database|postgres|\bsql\b/i,
    member: /database|postgres|\bsql\b|ฐานข้อมูล/i,
  },
  {
    question: /devops|deploy|ดีพลอย|ci\s*\/\s*cd|github actions|docker/i,
    member: /devops|deploy|ci\s*\/\s*cd|github actions|docker/i,
  },
];

function findRecommendedMember(portfolio, question, language) {
  const english = language === 'en';
  const asksWho = english ? /\bwho\b|\bwhich (person|member)\b/i.test(question) : /ใคร|คนไหน/.test(question);
  if (!asksWho) return null;

  const topic = RECOMMENDATION_TOPICS.find(({ question: pattern }) => pattern.test(question));
  const asksForFit = english
    ? /\b(best|suitable|fit|should)\b/i.test(question)
    : /เหมาะ|ควร|ถนัด|เก่ง/.test(question);
  const asksAboutTask = english
    ? /\b(responsible|handle|work on|in charge|does|do)\b/i.test(question)
    : /รับผิดชอบ|ทำ|ดูแล/.test(question);
  if (!topic) {
    if (!asksForFit && !asksAboutTask) return null;
    return label(
      language,
      'ยังไม่มีข้อมูลสมาชิกที่ตรงกับงานนี้มากพอ จึงระบุคนที่เหมาะสมไม่ได้',
      'There is not enough team information to identify a suitable member for this task.',
    );
  }

  const member = topic && portfolio.members.find((person) => {
    const profile = [
      person.role,
      person.bio,
      ...(person.skills || []),
      ...(person.responsibilities || []),
      ...(person.projects || []).flatMap((project) => [project.title, project.description, ...(project.tech || [])]),
    ].filter(Boolean).join(' ');
    return topic.member.test(profile);
  });

  if (!member) {
    return label(
      language,
      'ยังไม่มีข้อมูลสมาชิกที่ตรงกับงานนี้มากพอ จึงระบุคนที่เหมาะสมไม่ได้',
      'There is not enough team information to identify a suitable member for this task.',
    );
  }

  return english
    ? asksForFit
      ? `${member.name} (${member.nickname}) is the best fit because their role is ${content(member.role, language)}.`
      : `${member.name} (${member.nickname}) is responsible for this area as a ${content(member.role, language)}.`
    : asksForFit
      ? `คนที่เหมาะกับงานนี้คือ ${member.name} (${member.nickname}) เพราะมีบทบาท ${content(member.role, language)}`
      : `${member.name} (${member.nickname}) รับผิดชอบงานส่วนนี้ในบทบาท ${content(member.role, language)}`;
}

export function findLocalAnswer(portfolio, question, language) {
  const english = language === 'en';
  const q = question.toLowerCase();
  if (english
    ? /everyone|all members|team members|introduce|who is on the team|who are (the )?(team )?members/.test(q)
    : /ทุกคน|สมาชิก.{0,12}(?:ใคร|มีใคร)|ใครอยู่ทีม|แนะนำ(?:สมาชิก|ทุกคน)/.test(q)) {
    return portfolio.members
      .map((member) => `${member.name} (${member.nickname}) — ${content(member.role, language)}`)
      .join('\n');
  }

  const recommendation = findRecommendedMember(portfolio, question, language);
  if (recommendation) return recommendation;

  const found = portfolio.members.find((member) =>
    q.includes(member.name.toLowerCase()) ||
    q.includes(member.nickname.toLowerCase()) ||
    member.skills.some((skill) => q.includes(skill.toLowerCase()))
  ) || (english && /design|frontend|front-end|ui\/ux/.test(q)
    ? portfolio.members.find((member) => /frontend|ui\/ux/i.test(`${member.role} ${member.skills.join(' ')}`))
    : null);

  if (found) {
    const projects = found.projects.map((project) => content(project.title, language)).join(', ');
    return english
      ? `${found.name} (${found.nickname}) is a ${content(found.role, language)}.\nSkills: ${found.skills.map((skill) => content(skill, language)).join(', ')}\nProjects: ${projects || '-'}`
      : `${found.name} (${found.nickname}) รับหน้าที่ ${content(found.role, language)}\nทักษะ: ${found.skills.map((skill) => content(skill, language)).join(', ')}\nผลงาน: ${projects || '-'}`;
  }

  const asksForPersonalProjects = english
    ? /\bpersonal\b|\bindividual\b|\beach (?:team )?(?:member|person)(?:'s)?\b|projects? by (?:each|every) (?:member|person)|member projects/i.test(q)
    : /ส่วนตัว|รายบุคคล|ของแต่ละคน|แต่ละคน/.test(q);
  if (asksForPersonalProjects) {
    const summaries = portfolio.members.map((member) => {
      const projects = member.projects.map((project) => {
        const description = project.description ? ` — ${content(project.description, language)}` : '';
        return `  • ${content(project.title, language)}${description}`;
      });
      const heading = `${member.name} (${member.nickname}) — ${content(member.role, language)}`;
      const details = projects.length
        ? projects.join('\n')
        : `  • ${label(language, 'ยังไม่มีผลงานส่วนตัวที่บันทึกไว้', 'No personal projects listed')}`;
      return `${heading}\n${details}`;
    });
    return `${label(language, 'ผลงานส่วนตัวของสมาชิกแต่ละคน', 'Personal projects by each member')}:\n${summaries.join('\n')}`;
  }

  if (english ? /contact|email|phone|reach/.test(q) : /ติดต่อ|อีเมล|โทร/.test(q)) {
    return portfolio.members
      .map((member) => `${member.name}: ${member.email}${member.phone ? ` / ${label(language, 'โทร', 'Phone')} ${member.phone}` : ''}`)
      .join('\n');
  }

  if (english ? /project|built|work|portfolio/.test(q) : /ผลงาน|โครงการ|โปรเจกต์/.test(q)) {
    return `${label(language, 'ผลงานที่ทำร่วมกัน', 'Group projects')}:\n${portfolio.groupProjects
      .map((project) => `• ${content(project.title, language)}: ${content(project.description, language)}`)
      .join('\n')}`;
  }

  return english
    ? `${portfolio.team.name} is a team of ${portfolio.members.length}. ${content(portfolio.team.concept, language)}`
    : `ทีม ${portfolio.team.name} มีสมาชิก ${portfolio.members.length} คน แนวคิด: ${content(portfolio.team.concept, language)}`;
}
