# CSCI4050

Cinema E-Booking System (CES)
1. Objective
This deliverable represents the first sprint implementation of the CES project. Teams must demonstrate
a working version of the system that integrates the front-end, backend, and the database for the
following features:
• Home Page – movies pulled dynamically from DB.
• Search – search movies by title.
• Filter – filter movies by genre. (The Ui will show two filter options by gnra and show date, but only the
filter by genre is working)
• Trailers – embedded and playable trailers.
• Movie Details Page – selecting a movie must display its details (title, rating, description, poster, trailer,
showtimes).
And a
• Prototype for Booking – selecting a showtime opens a Booking Page with the movie title and showtime
displayed. Booking logic and checkout logic will be implemented in later sprints.
2. Requirements
2.1 Home Page
• Retrieve movies dynamically from the Movie database table (movies should not be hardcoded).
• Display the movies under the correct category: Currently Running or Coming Soon; you need an
attribute in the Movie table to distinguish the status of the movie for this sprint, later you will
correct based on showings.
2.2Movie Details
• When a user selects a movie, a Movie Detail Page must appear.
• Display movie details: poster, title, rating, description, …, available showtimes, and trailer.
• Users should be able to play the trailer on the CES website.
• Show hardcoded showtimes for each movie (e.g., 2:00 PM, 5:00 PM, 8:00 PM).
2.3Search
• Users must be able to search for movies by title.
• The system displays matching movies or an appropriate message if no matches are found.
2.4Filter
• Users can see options to filter by genre or show date. Only the filter by genre is working. The
system displays the filtered results or an appropriate message if no results match the filter
criteria.
2.5Prototype Booking Page (UI only)
• When a showtime is selected, the system must display a Booking option that navigates to
the booking page.
• This booking page should show the selected movie and showtime, Ticket quantity inputs
for each category (senior, child, or adult), and the price of each category.
• The seating layout must be displayed, and users must be able to select seats.
- Backend booking logic is not required for this sprint.
This page is a UI prototype only.
2.6Data Seeding
• The database must be seeded with at least 10 movies.
• Seeded movies must include:
o Multiple genres
o Both states: Coming Soon and Currently Running
