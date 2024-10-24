function loadBryanBookings(filterDate = null) {
    const url = "https://script.google.com/macros/s/AKfycbyzr9VlVCT2CzkquXtBMryGhxGZx6HOMzKDGO_6OLWleeY0fmSdXFz4nEHKFAz-vTCmpQ/exec";

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Retrieve the bookings and sort them by date and time
            let bookings = data[0].data;

            // If a filter date is provided, filter the bookings based on that date
            if (filterDate) {
                bookings = bookings.filter(booking => {
                    const bookingDate = new Date(booking.BookingDate).toISOString().split('T')[0];
                    return bookingDate === filterDate;
                });
            }

            // Sort bookings by booking date and time
            bookings.sort((a, b) => {
                const dateA = new Date(a.BookingDate);
                const dateB = new Date(b.BookingDate);
                const timeA = a.TimeSlot.split(" - ")[0]; // Extract start time
                const timeB = b.TimeSlot.split(" - ")[0];

                // Convert times to Date objects for sorting
                const timeDateA = new Date(`${dateA.toISOString().split('T')[0]}T${timeA}:00`);
                const timeDateB = new Date(`${dateB.toISOString().split('T')[0]}T${timeB}:00`);

                // Compare by date first, then by time if dates are equal
                return dateA - dateB || timeDateA - timeDateB;
            });

            const appDiv = document.getElementById("app");
            appDiv.innerHTML = "";

            bookings.forEach(booking => {
                // Create the card container
                const card = document.createElement("div");
                card.className = "booking-card";

                // Status container (aligned top right)
                const statusContainer = document.createElement("div");
                statusContainer.className = "status";
                const statusIcon = document.createElement("img");
                statusIcon.src = "approvedIcon.png";
                statusIcon.alt = "Approved";
                statusContainer.appendChild(statusIcon);
                const statusText = document.createElement("span");
                statusText.textContent = "Approved";
                statusContainer.appendChild(statusText);

                // Icon container (Only one icon with adjusted size)
                const iconContainer = document.createElement("div");
                iconContainer.className = "booking-icon";
                const iconImage = document.createElement("img");
                iconImage.src = "icon.png";
                iconImage.alt = "Amenity Icon";
                iconContainer.appendChild(iconImage);

                const menuIcon = document.createElement("div");
                menuIcon.className = "menu-icon";
                menuIcon.innerHTML = `
                    <span>⋮</span>
                `;

                // Details container
                const detailsContainer = document.createElement("div");
                detailsContainer.className = "booking-details";
                detailsContainer.innerHTML = `
                    <h2>${booking.AmenityName}</h2>
                    <p style="margin-bottom: 6px;">Booking date</p>
                    <p class="valueDiv" style="margin-bottom: 24px;">${formatDate(booking.BookingDate, true)}</p>
                    <p style="margin-bottom: 6px;">Time slot</p>
                    <p class="valueDiv" style="margin-bottom: 16px;">${formatTimeSlot(booking.TimeSlot)}</p>
                    <div class="flex-row">
                        <div>
                            <p style="margin-bottom: 6px;">Service Req Number</p>
                            <p class="valueDiv">${booking.ServiceRequestNumber}</p>
                        </div>
                        <div class="ServiceReqDiv">
                            <p>Service Req</p>
                            <p style="margin-bottom: 6px;">Raised Date</p>
                            <p class="valueDiv">${formatDate(booking.BookingDate, false)}</p>
                        </div>
                    </div>
                `;

                // Append all elements to the card
                card.appendChild(statusContainer);
                card.appendChild(iconContainer);
                card.appendChild(detailsContainer);

                // Append the card to the main container
                appDiv.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading bookings:", error);
            document.getElementById("app").textContent = "Error loading bookings.";
        });
}

// Helper function to format the date
function formatDate(dateStr, includeWeekday = true) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();

    if (includeWeekday) {
        const weekday = date.toLocaleString('en-GB', { weekday: 'short' });
        return `${weekday}, ${day}-${month}-${year}`;
    } else {
        return `${day}-${month}-${year}`;
    }
}

function formatTimeSlot(timeSlot) {
    const [startTime, endTime] = timeSlot.split(" - ");
    const start12Hour = convertTo12Hour(startTime);
    const end12Hour = convertTo12Hour(endTime);
    return `${start12Hour} - ${end12Hour}`;
}

function convertTo12Hour(time) {
    const [hour, minute] = time.split(":").map(Number);
    const amPm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${minute} ${amPm}`;
}

// Attach the event listener to the button
document.getElementById("btn").addEventListener("click", () => loadBryanBookings());
document.getElementById("btn-today").addEventListener("click", () => {
    const today = new Date().toISOString().split('T')[0];
    loadBryanBookings(today);
});
document.getElementById("btn-tomorrow").addEventListener("click", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    loadBryanBookings(tomorrow);
});
