<div align="center">
    <img src="public/favicon/android-chrome-512x512.png" alt="Logo" width="100" height="100" style="margin-bottom: -2rem;">

  <h2 align="center">Project Lauriault</h2>

  <p align="center">
    Ottawa Entertainment Visualization - Geospatial Data Analytics
  </p>
</div>

This application visualizes Ottawa's urban landscape through interactive data visualization, designed to combat Ottawa's "boring city" stereotype. It processes population, transportation, and entertainment venue data to reveal patterns and relationships using advanced spatial analysis techniques with H3 hexagonal indexing. (For Carleton University's DATA5000 Course)

The system provides multiple visualization layers:

- Transportation Heatmap (OC Transpo data)

- Entertainment Heatmap (Google Maps Places API data)

- Population Heatmap (2021 Census data)

- Entertainment Population Difference Analysis

- Entertainment Transport Difference Analysis

- Population Transport Difference Analysis

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Node.js 18.0 or higher

```
apt-get update
apt-get install nodejs
```

### Installing

A step by step series of examples that tell you how to get a development env running

```
git clone https://github.com/JustinZhang17/lauriault.git  
cd lauriault  
npm install
```

Run the following command to start the application

```
npm run dev
```

### Usage

The application provides an interactive map interface with layer selection controls. You can configure visualization parameters using URL query parameters:

- **resolution**: H3 hexagon resolution level (default: 8)

- **topK**: Number of top differences to highlight (default: 10)

- **attPopuScaling**: Entertainment-population scaling factor (default: 2)

- **attOCScaling**: Entertainment-transit scaling factor (default: 50)

- **popuOCScaling**: Population-transit scaling factor (default: 2)

- **popuNorm**: Population normalization factor (default: 5)

Example URL: http://localhost:5173?resolution=7&topK=15

## Built With

[![](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white)]()
[![](https://img.shields.io/badge/Node.js-000000?style=for-the-badge&logo=node.js&logoColor=white)]()
[![](https://img.shields.io/badge/Typescript-000000?style=for-the-badge&logo=typescript&logoColor=white)]()
[![](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=Vercel&logoColor=white)]()
[![](https://img.shields.io/badge/Deck.GL-000000?style=for-the-badge&logo=DeckGL&logoColor=white)]()
[![](https://img.shields.io/badge/Loaders.GL-000000?style=for-the-badge&logo=LoadersGL&logoColor=white)]()
[![](https://img.shields.io/badge/H3-000000?style=for-the-badge&logo=H3&logoColor=white)]()
[![](https://img.shields.io/badge/TailwindCSS-000000?style=for-the-badge&logo=TailwindCSS&logoColor=white)]()
[![](https://img.shields.io/badge/MapLibre-000000?style=for-the-badge&logo=MapLibre&logoColor=white)]()


## Contributing

If you see an issue or would like to contribute, please do & open a pull request or ticket for/with new features or fixes

## Authors

- **Justin Zhang** - _Initial work_ - [JustinZhang17](https://github.com/JustinZhang17)
- **Hanna Khan** - _Initial work_ - [HannaKhan](https://www.linkedin.com/in/hanna-khan-09925a362/)
  
## License

This project is licensed under the GNU GPLv3 License - see the [LICENSE.md](LICENSE.md) file for details

## Miscellaneous

The application processes three main CSV datasets:

- `population_dissemination_areas.csv` - Geographic boundaries and population data

- `oc_transpo.csv` - Ottawa transit system data

- `local_entertainment.csv` - Entertainment venue locations from Google Maps Places API

The application requires large screens for optimal viewing and displays a fallback message on mobile devices.

### [What's the meaning behind the name](https://blog.justinjzhang.com/behind-the-names/)

### [Who is Tracey Lauriault?](https://carleton.ca/sjc/profile/lauriault-tracey/)
