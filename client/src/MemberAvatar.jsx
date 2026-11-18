export default function MemberAvatar({ member, large = false }) {
  const className = `avatar${large ? ' xl' : ''}${member.nickname === 'อัง' ? ' photo' : ''}`;

  if (member.nickname === 'อัง') {
    return (
      <div className={className}>
        <img src={`${import.meta.env.BASE_URL}P1.PNG`} alt={`รูปโปรไฟล์ของ${member.name}`} />
      </div>
    );
  }

  return <div className={className}>{member.role?.trim()?.[0] || member.emoji}</div>;
}
