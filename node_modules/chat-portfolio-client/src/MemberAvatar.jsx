export default function MemberAvatar({ member, large = false, language }) {
  const photo = member.nickname === 'อัง' ? 'P1.jpg' : member.nickname === 'ปีใหม่' ? 'P2.jpg' : member.nickname === 'ขนุน' ? 'P3.jpg' : null;
  const className = `avatar${large ? ' xl' : ''}${photo ? ' photo' : ''}`;

  if (photo) {
    return (
      <div className={className}>
        <img
          src={`${import.meta.env.BASE_URL}${photo}`}
          alt={language === 'en' ? `Photo of ${member.name}` : `รูปโปรไฟล์ของ${member.name}`}
        />
      </div>
    );
  }

  return <div className={className}>{member.role?.trim()?.[0] || member.emoji}</div>;
}
