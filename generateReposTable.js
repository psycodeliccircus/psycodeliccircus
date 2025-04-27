import fetch from 'node-fetch';
import fs from 'fs';

const GITHUB_USERNAME = process.env.GH_USERNAME || 'YOUR_GITHUB_USERNAME';
const GITHUB_TOKEN = process.env.GH_TOKEN || 'YOUR_GITHUB_TOKEN';

async function fetchRepos(username) {
  const repos = [];
  let page = 1;
  const perPage = 100;
  let fetchedData = [];

  do {
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      console.error(`fetch error: ${response.status} ${response.statusText}`);
      break;
    }

    fetchedData = await response.json();
    repos.push(...fetchedData);
    page++;
  } while (fetchedData.length === perPage);

  return repos;
}

function generateMarkdownTable(repos) {
  let table = '| 🗃 Projetos | 📡 Status | ⚙️ Tecnologia | ⭐ Stars | 🖨 Forks |\n';
  table += '| ----------- | ----------- | ----------- | ----------- | ----------- |\n';

  repos.forEach((repo) => {
    const status = repo.private ? '🔒 Privado' : '🌐 Público';

    const techBadge = repo.language
      ? `![${repo.language}](https://img.shields.io/badge/-${encodeURIComponent(repo.language)}-blue?style=flat-square)`
      : '';

    const starsBadge = `![Stars](https://img.shields.io/github/stars/${GITHUB_USERNAME}/${repo.name}?style=flat-square)`;
    const forksBadge = `![Forks](https://img.shields.io/github/forks/${GITHUB_USERNAME}/${repo.name}?style=flat-square)`;

    table += `| [${repo.name}](${repo.html_url}) | **${status}** | ${techBadge} | ${starsBadge} | ${forksBadge} |\n`;
  });

  return table;
}

async function main() {
  try {
    const repos = await fetchRepos(GITHUB_USERNAME);
    console.log(`repositorise size: ${repos.length}`);
    const markdownTable = generateMarkdownTable(repos);
    fs.writeFileSync('REPOSITORIES.md', markdownTable);
    console.log('REPOSITORIES.md has successfully created.');
  } catch (error) {
    console.error('get an error:', error);
  }
}

main();
