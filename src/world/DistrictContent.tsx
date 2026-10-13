
import {
  about,
  contact,
  experiences,
  gmailCompose,
  projects,
  skills,
} from '../portfolioData'
import type { DistrictName } from './districts'

type Props = {
  district: DistrictName
}

const linkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 13px',
  border: '1px solid rgba(34,211,238,0.45)',
  borderRadius: '8px',
  color: '#67e8f9',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 600,
} as const

const cardStyle = {
  padding: '20px',
  marginTop: '16px',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: '12px',
  background: 'rgba(15,23,42,0.75)',
} as const

const tagStyle = {
  display: 'inline-block',
  padding: '5px 9px',
  border: '1px solid rgba(34,211,238,0.25)',
  borderRadius: '6px',
  color: '#a5f3fc',
  fontSize: '12px',
} as const

function Tags({ items }: { items: readonly string[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '7px',
        marginTop: '14px',
      }}
    >
      {items.map(item => (
        <span key={item} style={tagStyle}>
          {item}
        </span>
      ))}
    </div>
  )
}

export default function DistrictContent({
  district,
}: Props) {
  switch (district) {
    case 'PROJECTS':
      return (
        <div>
          <p>
            Explore applications I've built, including
            live demos and source code.
          </p>

          {projects.map(project => (
            <article key={project.id} style={cardStyle}>
              <small style={{ color: '#67e8f9' }}>
                / {project.id} — {project.category}
              </small>

              <h3 style={{ margin: '12px 0 6px' }}>
                {project.name}
              </h3>

              <strong style={{ color: '#cbd5e1' }}>
                {project.subtitle}
              </strong>

              <p>{project.description}</p>

              <Tags items={project.tags} />

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '18px',
                }}
              >
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkStyle}
                  >
                    Live Demo ↗
                  </a>
                )}

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkStyle}
                  >
                    GitHub ↗
                  </a>
                )}

                <span style={{ color: '#94a3b8' }}>
                  {project.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      )

    case 'EXPERIENCE':
      return (
        <div>
          <p>
            Professional engineering experience
            across financial technology and software.
          </p>

          {experiences.map(experience => (
            <article
              key={`${experience.company}-${experience.dates}`}
              style={cardStyle}
            >
              <small style={{ color: '#67e8f9' }}>
                {experience.dates}
              </small>

              <h3 style={{ margin: '12px 0 5px' }}>
                {experience.role}
              </h3>

              <strong>
                {experience.company} · {experience.location}
              </strong>

              <ul
                style={{
                  paddingLeft: '20px',
                  lineHeight: 1.8,
                  color: '#cbd5e1',
                }}
              >
                {experience.points.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <Tags items={experience.tags} />
            </article>
          ))}
        </div>
      )

    case 'SKILLS':
      return (
        <div>
          <p>
            Technologies and engineering practices
            behind the products I build.
          </p>

          {skills.map(skill => (
            <article key={skill.title} style={cardStyle}>
              <small style={{ color: '#67e8f9' }}>
                {skill.subtitle}
              </small>

              <h3 style={{ margin: '10px 0' }}>
                {skill.title}
              </h3>

              <Tags items={skill.items} />
            </article>
          ))}
        </div>
      )

    case 'ABOUT':
      return (
        <div>
          <p>{about.introduction}</p>
          <p>{about.philosophy}</p>

          <h3 style={{ marginTop: '28px' }}>
            Education
          </h3>

          {about.education.map(item => (
            <article key={item.institution} style={cardStyle}>
              <strong>{item.degree}</strong>
              <p>{item.institution}</p>
              <small>{item.year}</small>
            </article>
          ))}

          <h3 style={{ marginTop: '28px' }}>
            Certifications
          </h3>

          {about.certifications.map(certification => (
            <article key={certification} style={cardStyle}>
              {certification}
            </article>
          ))}
        </div>
      )

    case 'CONTACT':
      return (
        <div>
          <p>
            I'm open to software engineering
            opportunities and conversations about
            building great products.
          </p>

          <article style={cardStyle}>
            <h3>Let's connect</h3>

            <p>{contact.email}</p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              <a
                href={gmailCompose}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Send Email ↗
              </a>

              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                LinkedIn ↗
              </a>

              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                GitHub ↗
              </a>

              <a
                href={contact.resume}
                download="Likith-Kumar-Resume.pdf"
                style={linkStyle}
              >
                Download Resume ↓
              </a>
            </div>
          </article>
        </div>
      )
  }
}
