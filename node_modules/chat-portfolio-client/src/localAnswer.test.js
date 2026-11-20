import assert from 'node:assert/strict';
import test from 'node:test';
import { findLocalAnswer } from './localAnswer.js';

const portfolio = {
  team: { name: 'Do Ra E Mo Nueng', concept: 'ทีมพัฒนาซอฟต์แวร์' },
  groupProjects: [
    { title: 'Chat AI พร้อม Portfolio', description: 'ผลงานร่วมกัน', tech: [] },
  ],
  members: [
    {
      name: 'อังคนา จุติ',
      nickname: 'อัง',
      role: 'Frontend Developer & UI/UX Designer',
      bio: 'รับผิดชอบการออกแบบ UI/UX และงาน Frontend',
      skills: ['ออกแบบ UI/UX', 'Figma'],
      responsibilities: ['ออกแบบ UI/UX สำหรับเว็บไซต์'],
      projects: [{ title: 'ออกแบบเว็บไซต์', description: 'ออกแบบหน้าเว็บและประสบการณ์ใช้งาน', tech: [] }],
    },
    {
      name: 'กนกภรณ์ วงค์จันทเรือง',
      nickname: 'ปีใหม่',
      role: 'Backend Developer & AI Engineer',
      bio: '',
      skills: ['Node.js', 'Express'],
      responsibilities: [],
      projects: [{ title: 'AI Hackathon', description: 'เข้ารอบชิงชนะเลิศ', tech: [] }],
    },
  ],
};

test('Thai UI-design recommendation names the matching member directly', () => {
  const reply = findLocalAnswer(portfolio, 'ใครเหมาะกับงานออกแบบ UI?', 'th');

  assert.match(reply, /^คนที่เหมาะกับงานนี้คือ อังคนา จุติ/);
  assert.match(reply, /Frontend Developer & UI\/UX Designer/);
});

test('English UI-design recommendation names the matching member directly', () => {
  const reply = findLocalAnswer(portfolio, 'Who is best suited for UI design?', 'en');

  assert.match(reply, /^อังคนา จุติ/);
  assert.match(reply, /UI\/UX Designer/);
});

test('Thai backend responsibility question names its owner', () => {
  const reply = findLocalAnswer(portfolio, 'ใครทำในส่วนของ Backend?', 'th');

  assert.match(reply, /^กนกภรณ์ วงค์จันทเรือง \(ปีใหม่\) รับผิดชอบงานส่วนนี้/);
  assert.match(reply, /Backend Developer & AI Engineer/);
});

test('English backend ownership question names its owner', () => {
  const reply = findLocalAnswer(portfolio, 'Who handles the backend?', 'en');

  assert.match(reply, /^กนกภรณ์ วงค์จันทเรือง \(ปีใหม่\) is responsible/);
  assert.match(reply, /Backend Developer & AI Engineer/);
});

test('asking who the team members are returns the member list', () => {
  const reply = findLocalAnswer(portfolio, 'สมาชิกทีมมีใครบ้าง', 'th');

  assert.match(reply, /อังคนา จุติ/);
  assert.match(reply, /กนกภรณ์ วงค์จันทเรือง/);
  assert.doesNotMatch(reply, /ไม่มีข้อมูลสมาชิก/);
});

test('asking for each member’s personal projects does not return group projects', () => {
  const reply = findLocalAnswer(portfolio, 'สรุปผลงานของแต่ละคนให้หน่อย', 'th');

  assert.match(reply, /อังคนา จุติ/);
  assert.match(reply, /ออกแบบเว็บไซต์/);
  assert.match(reply, /กนกภรณ์ วงค์จันทเรือง/);
  assert.match(reply, /AI Hackathon/);
  assert.doesNotMatch(reply, /ผลงานที่ทำร่วมกัน|Chat AI พร้อม Portfolio/);
});

test('unknown member recommendations do not fall back to a team overview', () => {
  const reply = findLocalAnswer(portfolio, 'ใครเหมาะกับงานการแพทย์?', 'th');

  assert.match(reply, /ระบุคนที่เหมาะสมไม่ได้/);
  assert.doesNotMatch(reply, /ทีม Do Ra E Mo Nueng มีสมาชิก/);
});
