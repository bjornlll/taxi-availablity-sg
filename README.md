# taxi-proximity-sg

## Run

After cloning the repository and doing `npm install`, you need to set two environment variables, a google maps API key as well 
as a data.gov.sg API key.

```
GOOGLE_MAPS_API_KEY={your-api-key} DATA_GOV_SG_API_KEY={your-api-key} node index.js
```

## Example output
```
? From where would you like to get a taxi: Orchard Road

Nearest taxis from your address "Orchard Rd, Singapore":
 - There is an available taxi at "1 Grange Rd, Singapore 239693", 71 meters away
 - There is an available taxi at "Emerald Link, Singapore", 82 meters away
 - There is an available taxi at "1 Grange Rd, Singapore 239693", 85 meters away
 - There is an available taxi at "333A Orchard Rd, Singapore 238897", 85 meters away
 - There is an available taxi at "1 Grange Rd, Singapore 239693", 91 meters away

? From where would you like to get a taxi: OCBC Centre

Nearest taxis from your address "65 Chulia Street, #01-00 OCBC Centre, Singapore 049513":
 - There is an available taxi at "26 Boat Quay, Singapore 049816", 75 meters away
 - There is an available taxi at "80 Raffles Place, Singapore 048624", 80 meters away
 - There is an available taxi at "S Canal Rd, Singapore", 88 meters away
 - There is an available taxi at "18 Church St, Singapore 049479", 92 meters away
 - There is an available taxi at "Synagogue St, Singapore", 107 meters away
```
