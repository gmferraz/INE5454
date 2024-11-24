const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const formatDatePosted = (datePosted) => {
  if (datePosted.includes('h')) {
    const hours = datePosted.replace('h', '').trim();
    return `${hours} hours ago`;
  } else if (datePosted.includes('d')) {
    const days = datePosted.replace('d', '').trim();
    return `${days} days ago`;
  } else if (datePosted.includes('w')) {
    const weeks = datePosted.replace('w', '').trim();
    return `${weeks} weeks ago`;
  } else {
    return datePosted;
  }
};

const convertDateToMinutes = (datePosted) => {
  let minutes = 0;
  if (datePosted.includes('hours')) {
    minutes = parseInt(datePosted) * 60;
  } else if (datePosted.includes('days')) {
    minutes = parseInt(datePosted) * 24 * 60;
  } else if (datePosted.includes('weeks')) {
    minutes = parseInt(datePosted) * 7 * 24 * 60;
  }
  return minutes;
};

async function scrapeWeWorkRemotely() {
  const url = 'https://weworkremotely.com/remote-jobs';

  try {
    const { data: htmlContent } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const $ = cheerio.load(htmlContent);
    const jobs = $('section.jobs li.feature');
    const jobList = [];

    jobs.each((i, job) => {
      const title = $(job).find('span.title').text().trim() || 'Not available';
      const company = $(job).find('span.company').text().trim() || 'Not available';
      const location = $(job).find('span.region').text().trim() || 'Not available';
      const links = $(job).find('a');
      const jobLink = links.length > 1 ? `https://weworkremotely.com${$(links[1]).attr('href')}` : 'Not available';
      const datePosted = $(job).find('span.listing-date__date').text().trim() || 'Not available';
      const formattedDate = formatDatePosted(datePosted);

      jobList.push({
        title,
        company,
        location,
        job_link: jobLink,
        date_posted: formattedDate
      });
    });

    return jobList;
  } catch (error) {
    console.error('Erro ao fazer scraping no We Work Remotely:', error);
  }
}

async function scrapeRemoteIO() {
  const url = 'https://www.remote.io/remote-software-development-jobs';

  try {
    const { data: htmlContent } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    const $ = cheerio.load(htmlContent);
    const jobs = $('div.sm\\:rounded-md.sm\\:mx-0.lg\\:hidden.shadow-singlePostMobile.flex.items-center.flex-grow.px-4.py-2.-mx-4.bg-white.rounded-none');
    const jobList = [];

    jobs.each((i, job) => {
      const title = $(job).find('a[data-title="true"]').text().trim() || 'Not available';
      const company = $(job).find('p[data-text="true"]').text().trim() || 'Not available';
      const location = $(job).find('a[data-tag="true"]').text().trim() || 'Not available';
      const jobLink = $(job).find('a[data-title="true"]').attr('href') ? `https://www.remote.io${$(job).find('a[data-title="true"]').attr('href')}` : 'Not available';
      const datePosted = $(job).find('span.text-gray-400').text().trim() || 'Not available';
      const formattedDate = formatDatePosted(datePosted);

      jobList.push({
        title,
        company,
        location,
        job_link: jobLink,
        date_posted: formattedDate
      });
    });

    return jobList;
  } catch (error) {
    console.error('Erro ao fazer scraping no Remote.io:', error);
  }
}

function generateHTML(jobs) {
  let htmlContent = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trabalhos remotos - Gui e Zé</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Roboto', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
      header { background-color: #3a7bd5; color: white; padding: 20px 0; text-align: center; font-size: 2rem; }
      main { max-width: 1200px; margin: 30px auto; padding: 0 20px; }
      .job-list { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
      .job-card { background-color: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
      .job-card h3 { font-size: 1.5rem; color: #333; margin-bottom: 10px; }
      .job-card p { font-size: 1rem; color: #555; }
      .job-card .company { font-weight: bold; margin-top: 10px; }
      .job-card .location { font-style: italic; margin-bottom: 10px; }
      .job-card .date-posted { color: #888; margin-bottom: 10px; }
      .job-card a { display: inline-block; text-decoration: none; background-color: #3a7bd5; color: white; padding: 10px 15px; border-radius: 5px; text-align: center; }
      .job-card a:hover { background-color: #335aa1; }
      footer { text-align: center; margin: 50px 0; color: #888; }
    </style>
  </head>
  <body>
    <header>Trabalhos remotos - Gui e Zé</header>
    <main>
      <div class="job-list">`;

  jobs.forEach(job => {
    htmlContent += `
      <div class="job-card">
        <h3>${job.title}</h3>
        <p class="company">${job.company}</p>
        <p class="location">${job.location}</p>
        <p class="date-posted">Posted: ${job.date_posted}</p>
        <a href="${job.job_link}" target="_blank">Ver vaga</a>
      </div>`;
  });

  htmlContent += `
      </div>
    </main>
    <footer>&copy; 2024 - Gui e Zé</footer>
  </body>
  </html>`;

  fs.writeFileSync('remote_jobs.html', htmlContent, 'utf8');
  fs.writeFileSync('jobs.json', JSON.stringify(jobs, null, 2), 'utf8');
  console.log('Arquivo HTML gerado com sucesso: remote_jobs.html');
}

async function scrapeAllJobs() {
  const weWorkRemotelyJobs = await scrapeWeWorkRemotely();
  const remoteIOJobs = await scrapeRemoteIO();

  const allJobs = [...weWorkRemotelyJobs, ...remoteIOJobs];

  // Ordenando as vagas por data (em minutos)
  allJobs.sort((a, b) => convertDateToMinutes(a.date_posted) - convertDateToMinutes(b.date_posted));

  // Gerando o arquivo HTML
  generateHTML(allJobs);
}

// Executando a função
scrapeAllJobs();
