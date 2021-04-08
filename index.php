<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Weather</title>
	<link rel="stylesheet" href="css/style.min.css">
	<link id="styleTime" rel="stylesheet" href="css/style-day.css">
	<script src="JS/jquery.min.js"></script>
	<script defer src="JS/weather.min.js"></script>
	<title>Document</title>
</head>

<body onload='getWeather("london")'>
	<script id="weatherResult"></script>
	<main>
		<section class="social">
			<a href="https://www.twitter.com/jayuk79" target="_blank"><img src="img/Twitter_32.png"alt="Twitter"></a>
			<a href="https://github.com/jayuk79" target="_blank"><img src="img/GitHub_32_light.png" alt="GitHub"></a>
		</section>

		<form id="weatherForm" action="javascript:getWeather(this.city.value)" method="get">
			<label class="location-label" for="city">Search for Weather</label>
			<div class="form-inputs">
				<input type="text" name="city" id="city" placeholder="Location">
				<input type="submit" class="search-button" value="Go">
			</div>
		</form>
		<div class="container">
			<img id="loading" src="img/loading.gif" alt="">
		</div>
		<section id="mainWeather">
			<div class="container">
				<section id="error" class="error">
					<p id="errorText" class="errorText"></p>
				</section>
			</div>
			<div class="container">
				<section id="details" class="details">
					<img id="warning" src="img/warning.png" alt="Weather Alerts Issued" title="Weather Alerts Issued"
						class="warning">
					<footer>
						<p id="currentTime"></p>
					</footer>
					<section class="main-details">
						<header>
							<h1 id="locationName" class="location"></h1>
						</header>
						<section class="temp">
							<img id="weather-icon" src="" alt="Weather Icon" title="">
							<div>
								<p id="currentTemp"></p>
								<p class="feelsLike">Feels like: <span id="currentFeelsLike"></span></p>
							</div>
						</section>
					</section>
					<p id="weatherDescription" class="weatherDescription"></p>
					<section class="wind current-wind">
						<section id="windDeg" class="windDeg">
							<img id="wind-speed" src="img/wind.png" alt="Wind">
							<p id="windSpeed"></p>
							<p id="gusts" class="gusts"></p>
						</section>

						<section class="sunrise">
							<span>
								<img src="img/sunrise.png" alt="Sunrise">
								<p id="sunrise"></p>
							</span>
							<span>
								<img src="img/sunset.png" alt="Sunset">
								<p id="sunset"></p>
							</span>
						</section>
					</section>
				</section>
			</div>
			<div class="container">
				<section id="alerts" class="alerts">
					<header id="alertHeader">
						<h2 class="">Weather Alerts</h2>
						<img id="warning_arrow" class="warning_arrow" src="img/down_arrow.png" alt="Expand Alerts">
					</header>
			</div>
			<div class="container">
				<section id="alertBody" class="alertBody">

				</section>
			</div>
			<div class="container">
				<p class="location-label next24">48 Hours</p>
				<section id="hourly-forecast" class="hourly-forecast">
				</section>
			</div>
			<div class="container">
				<p class="location-label next24 next7">7 Days</p>
				<section id="daily-forecast" class="daily-forecast">
				</section>
			</div>
		</section>

	</main>

	<footer class="main-footer">
		<p class="copyright">Copyright &copy; 2020 - <?= date("Y") ?> <a href="http://localhost/jason/jrwebdev">Jason Robinson</a></p>
		<p class="data-supplier">Weather data from <a href="https://openweathermap.org/" target="_blank" rel="noopener"
				title="openweathermap.org">openweathermap.org</a></p>
	</footer>
</body>

</html>