import assert from 'node:assert/strict';
import test from 'node:test';
import { ensureDirectRecommendation, findRelevantMembers } from './ai.js';

const members = [
  {
    name: 'อังคนา จุติ',
    nickname: 'อัง',
    role: 'Frontend Developer & UI/UX Designer',
    skills: ['ออกแบบ UI/UX', 'Leadership', 'HTML/CSS', 'JavaScript', 'Figma'],
    responsibilities: ['ออกแบบ UI/UX สำหรับเว็บไซต์', 'พัฒนา Frontend'],
    projects: [],
  },
  {
    name: 'กนกภรณ์ วงค์จันทเรือง',
    nickname: 'ปีใหม่',
    role: 'Backend Developer & AI Engineer',
    skills: ['JavaScript', 'API Integration', 'Prompt Engineering', 'Node.js', 'Express'],
    responsibilities: [],
    projects: [],
  },
];

test('a Thai UI design question ranks the UI/UX member first', () => {
  const relevant = findRelevantMembers({ members }, 'ใครเหมาะกับงานออกแบบ UI?');
  assert.equal(relevant[0].name, 'อังคนา จุติ');
});

test('a generic AI response is replaced by a direct, fact-based recommendation', () => {
  const relevant = findRelevantMembers({ members }, 'ใครเหมาะกับงานออกแบบ UI?');
  const reply = ensureDirectRecommendation(
    'ใครเหมาะกับงานออกแบบ UI?',
    'ทีม Do Ra E Mo Nueng มีสมาชิก 3 คน แบ่งบทบาทกันชัดเจน',
    relevant,
  );

  assert.match(reply, /อังคนา จุติ/);
  assert.match(reply, /Frontend Developer & UI\/UX Designer/);
  assert.match(reply, /ออกแบบ UI\/UX/);
});

test('a recommendation buried after a team overview is replaced with a direct answer', () => {
  const relevant = findRelevantMembers({ members }, 'ใครเหมาะกับงานออกแบบ UI?');
  const reply = ensureDirectRecommendation(
    'ใครเหมาะกับงานออกแบบ UI?',
    'ทีม Do Ra E Mo Nueng มีสมาชิก 3 คน อังคนา จุติเหมาะกับงานนี้',
    relevant,
  );

  assert.match(reply, /^คนที่เหมาะกับงานนี้ที่สุดคือ อังคนา จุติ/);
});

test('a direct recommendation from the AI and non-recommendation answers are preserved', () => {
  const relevant = findRelevantMembers({ members }, 'ใครเหมาะกับงานออกแบบ UI?');
  const directReply = 'อังคนา จุติเหมาะกับงานนี้';
  const generalReply = 'ทีมนี้มีสมาชิก 3 คน';

  assert.equal(ensureDirectRecommendation('ใครเหมาะกับงานออกแบบ UI?', directReply, relevant), directReply);
  assert.equal(ensureDirectRecommendation('ทีมเราทำอะไร?', generalReply, relevant), generalReply);
});

test('an ownership question is corrected when the AI only gives a team overview', () => {
  const backendMember = {
    name: 'กนกภรณ์ วงค์จันทเรือง',
    nickname: 'ปีใหม่',
    role: 'Backend Developer & AI Engineer',
    skills: ['Node.js', 'Express'],
  };
  const reply = ensureDirectRecommendation(
    'ใครทำในส่วนของ Backend?',
    'ทีม Do Ra E Mo Nueng มีสมาชิก 3 คน',
    [backendMember],
  );

  assert.match(reply, /^กนกภรณ์ วงค์จันทเรือง \(ปีใหม่\) รับผิดชอบงานส่วนนี้/);
});
