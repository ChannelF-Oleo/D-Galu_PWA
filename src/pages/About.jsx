// src/pages/About.jsx
import React from "react";
import "../styles/About.css";
import EstilistaFoto from "../assets/images/Estilista.jpg";
import ColoristaFoto from "../assets/images/Colorista.jpg";
import Manicurista from "../assets/images/Manicurista.jpg";

/* ===== Card reutilizable (solo para Nosotros) ===== */
const TeamCard = ({ photo, name, role, quote }) => {
  return (
    <article className="team-card">
      <div className="team-card__image">
        {photo ? (
          <img src={photo} alt={name} />
        ) : (
          <div className="team-card__placeholder" />
        )}
      </div>

      <div className="team-card__content">
        <h4 className="team-card__name">{name}</h4>
        <p className="team-card__role">{role}</p>
        <p className="team-card__quote">“{quote}”</p>
      </div>
    </article>
  );
};

/* ===== Array editable de personal ===== */
const teamMembers = [
  {
    name: "María Pérez",
    role: "Estilista Profesional",
    quote: "La belleza comienza cuando te sientes tú misma.",
    photo: EstilistaFoto,
  },
  {
    name: "Ana Rodríguez",
    role: "Especialista en Uñas",
    quote: "Cada detalle cuenta cuando se trata de estilo.",
    photo: Manicurista,
  },
  {
    name: "Laura Gómez",
    role: "Colorista",
    quote: "El color correcto puede cambiarlo todo.",
    photo: ColoristaFoto,
  },
];

const About = () => {
  return (
    <section className="about-page">
      {/* Hero */}
      <div className="about-hero">
        <h1 className="about-hero__title">Nuestra Historia</h1>
        <p className="about-hero__subtitle">
          Más que un salón, D’Galú es un espacio donde la belleza se encuentra con el bienestar.
        </p>
      </div>

      <div className="about-container">
        {/* Misión y Visión */}
        <div className="about-grid">
          <div className="about-card">
            <h3 className="about-card__title">Nuestra Misión</h3>
            <p className="about-card__text">
              Brindar experiencias de belleza personalizadas que resalten la esencia
              única de cada cliente, con técnicas actualizadas y productos de calidad.
            </p>
          </div>

          <div className="about-card">
            <h3 className="about-card__title">Nuestra Visión</h3>
            <p className="about-card__text">
              Ser un salón referente por su profesionalismo, trato humano y resultados
              que generan confianza.
            </p>
          </div>
        </div>

        {/* Equipo */}
        <div className="about-team">
          <h2 className="about-team__title">El Equipo D’Galú</h2>

          <div className="about-team__grid">
            {teamMembers.map((member, index) => (
              <TeamCard
                key={index}
                name={member.name}
                role={member.role}
                quote={member.quote}
                photo={member.photo}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

