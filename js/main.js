const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  const closeNav = () => {
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const status = contactForm.querySelector(".form-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!status || !submitButton) {
      return;
    }
    const initialButtonText = submitButton.textContent;
    status.textContent = "";
    status.classList.remove("is-success", "is-error");
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours…";
    try {
      const formData = new FormData(contactForm);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Le formulaire n’a pas pu être envoyé."
        );
      }
      status.textContent =
        "Merci, votre demande a bien été envoyée. Je vous répondrai dans les meilleurs délais.";
      status.classList.add("is-success");
      contactForm.reset();
    } catch (error) {
      console.error("Erreur lors de l’envoi du formulaire :", error);
      status.textContent =
        "L’envoi n’a pas abouti. Merci de réessayer ou d’écrire à contact@e2nova-studio.fr.";
      status.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = initialButtonText;
    }
  });
}

const centerHashTarget = () => {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);

  if (target) {
    window.setTimeout(() => {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 80);
  }
};

centerHashTarget();
window.addEventListener("hashchange", centerHashTarget);

const canvas = document.querySelector(".nova-canvas");

if (canvas) {
  const context = canvas.getContext("2d");
  const particles = [];
  const pointer = { x: 0, y: 0, active: false };
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const createParticles = () => {
    particles.length = 0;
    const count = Math.min(86, Math.max(36, Math.floor((width * height) / 22000)));

    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.8 + 0.7,
      });
    }
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createParticles();
  };

  const drawLine = (from, to, alpha) => {
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.strokeStyle = `rgba(92, 200, 255, ${alpha})`;
    context.lineWidth = 1;
    context.stroke();
  };

  const render = () => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = "rgba(126, 203, 255, 0.55)";
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const nextParticle = particles[nextIndex];
        const distance = Math.hypot(particle.x - nextParticle.x, particle.y - nextParticle.y);

        if (distance < 118) {
          drawLine(particle, nextParticle, (1 - distance / 118) * 0.16);
        }
      }

      if (pointer.active) {
        const pointerDistance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);

        if (pointerDistance < 150) {
          drawLine(particle, pointer, (1 - pointerDistance / 150) * 0.24);
        }
      }
    });

    animationFrame = window.requestAnimationFrame(render);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  resize();
  render();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else {
      render();
    }
  });
}
