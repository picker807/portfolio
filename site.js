const developmentRoot = document.querySelector("#development-content");
const narrationRoot = document.querySelector("#narration-content");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function externalLink(label, url, className = "button button-ghost") {
  const node = el("a", className, label);
  node.href = url;
  node.target = "_blank";
  node.rel = "noreferrer";
  return node;
}

function projectMedia(item, className = "") {
  if (item.image) {
    const button = el("button", [className, "screenshot-button"].filter(Boolean).join(" "));
    button.type = "button";
    button.dataset.image = item.image;
    button.dataset.caption = item.caption;
    button.setAttribute("aria-label", `Open screenshot: ${item.caption}`);
    const image = el("img");
    image.src = item.image;
    image.alt = item.alt;
    image.loading = "lazy";
    button.append(image, el("span", "", `${item.caption}  ↗`));
    return button;
  }

  const placeholder = el("div", [className, "media-placeholder"].filter(Boolean).join(" "));
  placeholder.setAttribute("role", "img");
  placeholder.setAttribute("aria-label", item.alt);
  const copy = el("div", "media-placeholder-copy");
  copy.append(
    el("span", "media-placeholder-kicker", "Screenshot placeholder"),
    el("strong", "", item.placeholder || item.caption),
    el("small", "", item.caption)
  );
  placeholder.append(copy);
  return placeholder;
}

function renderDevelopment(project) {
  developmentRoot.replaceChildren();
  const overview = el("article", "project-overview");
  const heroShot = el("div", "project-hero-shot");
  const heroImage = el("img");
  heroImage.src = project.screenshots[0].image;
  heroImage.alt = project.screenshots[0].alt;
  heroImage.loading = "lazy";
  heroShot.append(heroImage);

  const summary = el("div", "project-summary");
  summary.append(el("p", "project-kicker", project.type), el("h3", "", project.title), el("p", "", project.summary));
  const meta = el("dl", "project-meta");
  [["Role", project.role], ["Scope", project.scope], ["Status", project.status], ["Hosting", project.hosting]].forEach(([term, detail]) => {
    const group = el("div");
    group.append(el("dt", "", term), el("dd", "", detail));
    meta.append(group);
  });
  const stack = el("ul", "stack-list");
  project.stack.forEach((technology) => stack.append(el("li", "", technology)));
  summary.append(meta, stack, externalLink("Visit the live site ↗", project.url));
  overview.append(heroShot, summary);
  developmentRoot.append(overview);

  const capabilities = el("div", "capability-strip");
  project.capabilities.forEach((capability, index) => {
    const card = el("article");
    card.append(el("span", "", String(index + 1).padStart(2, "0")), el("h4", "", capability.title), el("p", "", capability.description));
    capabilities.append(card);
  });
  developmentRoot.append(capabilities);

  const caseStudy = el("div", "case-study");
  project.story.forEach((section, index) => {
    const article = el("article");
    article.append(el("span", "case-study-number", String(index + 1).padStart(2, "0")), el("h4", "", section.heading), el("p", "", section.body));
    caseStudy.append(article);
  });
  developmentRoot.append(caseStudy);

  const screenshots = el("section", "screenshots");
  const heading = el("div", "screenshots-heading");
  heading.append(el("h3", "", "The system in use"));
  const grid = el("div", "screenshot-grid");
  project.screenshots.forEach((screenshot) => {
    grid.append(projectMedia(screenshot));
  });
  screenshots.append(heading, grid);
  developmentRoot.append(screenshots);

  if (project.adminShowcase) {
    const adminSection = el("section", "admin-section");
    const adminHeading = el("div", "admin-section-heading");
    const adminTitle = el("h3", "", project.adminShowcase.title);
    adminTitle.id = "admin-showcase-title";
    adminSection.setAttribute("aria-labelledby", adminTitle.id);
    adminHeading.append(adminTitle, el("p", "", project.adminShowcase.description));
    adminSection.append(adminHeading, projectMedia(project.adminShowcase, "admin-showcase"));
    developmentRoot.append(adminSection);
  }
}

function cover(book) {
  const wrapper = el("div", "audio-cover");
  if (book.image) {
    const image = el("img");
    image.src = book.image;
    image.alt = `${book.title} audiobook cover`;
    image.loading = "lazy";
    wrapper.append(image);
  } else {
    wrapper.classList.add("audio-cover-placeholder");
    wrapper.append(el("strong", "", book.title), el("small", "", "James Skeen · Aaron Picker"));
  }
  return wrapper;
}

function renderNarration(data) {
  narrationRoot.replaceChildren();
  const grid = el("div", "narration-grid");
  data.audiobooks.forEach((book) => {
    const card = el("article", "audio-card");
    const copy = el("div", "audio-copy");
    copy.append(el("p", "eyebrow", book.format), el("h3", "", book.title), el("p", "audio-byline", `Written by ${book.author} · Narrated by Aaron Picker`), el("p", "audio-description", book.description));
    const action = el("div", "audio-action");
    action.append(externalLink("Listen on Audible ↗", book.url));
    copy.append(action);
    card.append(cover(book), copy);
    grid.append(card);
  });
  narrationRoot.append(grid);

  const channelCard = el("article", "channel-card");
  const channelCopy = el("div", "channel-copy");
  channelCopy.append(el("p", "eyebrow", "Ongoing series"), el("h3", "", data.channel.title), el("p", "", data.channel.description), externalLink("Visit the channel ↗", data.channel.url, "button button-primary"));
  const channelArt = el("div", "channel-art");

  const channelImage = el("img", "channel-image");
  channelImage.src = data.channel.image;
  channelImage.alt =
    data.channel.imageAlt || `${data.channel.title} channel artwork`;

  channelArt.append(channelImage);
  channelCard.append(channelCopy, channelArt);
  narrationRoot.append(channelCard);
}

function showError(error) {
  console.error("Could not load portfolio data:", error);
  const message = el("p", "error", "The portfolio details could not be loaded. Please refresh the page or try again shortly.");
  developmentRoot.replaceChildren(message.cloneNode(true));
  narrationRoot.replaceChildren(message);
}

document.addEventListener("click", (event) => {
  const screenshot = event.target.closest(".screenshot-button");
  if (screenshot) {
    lightboxImage.src = screenshot.dataset.image;
    lightboxImage.alt = screenshot.dataset.caption;
    lightboxCaption.textContent = screenshot.dataset.caption;
    lightbox.showModal();
  }
  if (event.target.matches("[data-lightbox-close]")) lightbox.close();
});
lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
document.querySelector("[data-year]").textContent = new Date().getFullYear();

fetch("portfolio.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    renderDevelopment(data.development);
    renderNarration(data.narration);
  })
  .catch(showError);
