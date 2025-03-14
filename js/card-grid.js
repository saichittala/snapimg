document.addEventListener("DOMContentLoaded", function () {
    const options = [
        {
            title: 'Convert to JPG',
            description: 'Convert JPG, WEBP, SVG, and GIFs to JPG efficiently.',
            icon: 'img/JPG.svg',
            link: 'convert-to-jpg.html'
        },
        {
            title: 'Convert to PNG',
            description: 'Convert JPG, WEBP, SVG, and GIFs to PNG efficiently.',
            icon: 'img/PNG.svg',
            link: 'convert-to-png.html'
        },
        {
            title: 'Convert to WEBP',
            description: 'Convert JPG, PNG, SVG, GIFs to WebP efficiently.',
            icon: 'img/WEBP.svg',
            link: 'convert-to-webp.html'
        },
        {
            title: 'Compress Images',
            description: 'Compress JPG, PNG, SVG, GIFs efficiently while preserving quality.',
            icon: 'img/Compress.svg',
            link: 'compress-images.html'
        },
        {
            title: 'Remove Background',
            description: 'Resize your image to a specific width and height.',
            icon: 'img/bg-remove.svg',
            link: 'remove-background.html'
        },
        {
            title: 'Img to PDF',
            description: 'Convert JPG, PNG, SVG, and GIFs to PDF efficiently.',
            icon: 'img/pdf.svg',
            link: 'img-to-pdf.html'
        }
    ];

    function generateOptions(options) {
        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';  // Clear any existing content

        options.forEach(option => {
            const link = document.createElement('a');
            link.href = option.link;
            link.classList.add('option-link');

            const card = document.createElement('div');
            card.classList.add('option-card');

            const img = document.createElement('img');
            img.classList.add('options-icon');
            img.src = option.icon;
            img.alt = `${option.title}-icon`;

            const textContainer = document.createElement('div');

            const title = document.createElement('h2');
            title.textContent = option.title;

            const description = document.createElement('p');
            description.textContent = option.description;

            textContainer.appendChild(title);
            textContainer.appendChild(description);
            card.appendChild(img);
            card.appendChild(textContainer);
            link.appendChild(card);

            optionsGrid.appendChild(link);
        });
    }

    generateOptions(options);
});
