# TDX Rail API Documentation

## Overview

This document provides API usage information for the TDX (Transport Data eXchange) Taiwan Rail API, including Taiwan Railway Administration (TRA), Metro (MRT), and Alishan Forest Railway (AFR) services.

**Base URLs:**

- Basic Tier: `https://tdx.transportdata.tw/api/basic`
- Advanced Tier: `https://tdx.transportdata.tw/api/advanced`

**API Versions:**

- TRA/AFR: v3
- Metro: v2

## Authentication

The API uses OAuth2 Client Credentials flow.

### Getting API Credentials

1. Register for a TDX account at [TDX Platform](https://tdx.transportdata.tw)
2. Navigate to: 會員專區 → 資料服務 → API金鑰
3. Retrieve your `Client ID` and `Client Secret`

### Token Endpoint

```
POST https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token
```

### Required Parameters

- `grant_type`: "client_credentials"
- `client_id`: Your Client ID
- `client_secret`: Your Client Secret

## Common Query Parameters

All endpoints support OData-style query parameters:

- `$select`: Select specific fields
- `$filter`: Filter results (e.g., `StationID eq '1000'`)
- `$orderby`: Sort results
- `$top`: Limit number of results (default: 30)
- `$skip`: Skip first N results
- `$count`: Include total count
- `$format`: Response format (`JSON` or `XML`) - **Required**

## Key TRA Endpoints

### 1. Station Information

#### Get All Stations

```
GET /v3/Rail/TRA/Station?$format=JSON
```

Returns: List of all TRA stations with details including:

- StationID, StationName
- Location coordinates
- Station address
- Facilities information

#### Filter by Station ID

```
GET /v3/Rail/TRA/Station?$filter=StationID eq '1000'&$format=JSON
```

---

### 2. Train Schedules

#### Daily Train Timetable (Today)

```
GET /v3/Rail/TRA/DailyTrainTimetable/Today?$format=JSON
```

Returns: All train schedules for today

#### Daily Train Timetable (Specific Date)

```
GET /v3/Rail/TRA/DailyTrainTimetable/TrainDate/{TrainDate}?$format=JSON
```

**Path Parameter:**

- `TrainDate`: Date in format `yyyy-MM-dd` (e.g., `2026-02-03`)

**Note:** TRA provides daily timetables for approximately 60 days

#### Get Available Timetable Dates

```
GET /v3/Rail/TRA/DailyTrainTimetable/TrainDates?$format=JSON
```

Returns: List of dates for which daily timetables are available

#### Origin-Destination Schedule (Specific Date)

```
GET /v3/Rail/TRA/DailyTrainTimetable/OD/{OriginStationID}/to/{DestinationStationID}/{TrainDate}?$format=JSON
```

**Path Parameters:**

- `OriginStationID`: Departure station code
- `DestinationStationID`: Arrival station code
- `TrainDate`: Date in format `yyyy-MM-dd`

**Example:**

```
GET /v3/Rail/TRA/DailyTrainTimetable/OD/1000/to/1008/2026-02-03?$format=JSON
```

---

### 3. Station Timetable

#### Station Schedule (Today)

```
GET /v3/Rail/TRA/DailyStationTimetable/Today/Station/{StationID}?$format=JSON
```

#### Station Schedule (Specific Date)

```
GET /v3/Rail/TRA/DailyStationTimetable/TrainDate/{TrainDate}?$format=JSON
```

---

### 4. Live Train Information

#### Live Train Position

```
GET /v3/Rail/TRA/TrainLiveBoard?$format=JSON
```

Returns: Real-time train position data

**Important Notes:**

- Data represents the station the train **just departed from**
- Updates when train **leaves** a station (not when arriving)
- Includes both stop and pass-through stations
- Ensures accurate delay information for express trains

#### Live Train by Train Number

```
GET /v3/Rail/TRA/TrainLiveBoard/TrainNo/{TrainNo}?$format=JSON
```

#### Station Live Board

```
GET /v3/Rail/TRA/StationLiveBoard/Station/{StationID}?$format=JSON
```

Returns: Real-time arrival/departure information for a specific station

---

### 5. Fare Information

#### Get Fare Between Stations

```
GET /v3/Rail/TRA/ODFare/{OriginStationID}/to/{DestinationStationID}?$format=JSON
```

**Path Parameters:**

- `OriginStationID`: Origin station code
- `DestinationStationID`: Destination station code

**Example:**

```
GET /v3/Rail/TRA/ODFare/1000/to/1008?$format=JSON
```

#### All Fares (Compressed File)

```
GET /v3/Rail/TRA/ODFare
```

Returns: Gzipped file containing all fare data

---

### 6. Network & Line Information

#### Network Information

```
GET /v3/Rail/TRA/Network?$format=JSON
```

#### Line Information

```
GET /v3/Rail/TRA/Line?$format=JSON
```

#### Stations on Line

```
GET /v3/Rail/TRA/StationOfLine?$format=JSON
```

#### Line Network Topology

```
GET /v3/Rail/TRA/LineNetwork?$format=JSON
```

---

### 7. Station Facilities

#### Station Facilities

```
GET /v3/Rail/TRA/StationFacility?$format=JSON
```

#### Station Exits

```
GET /v3/Rail/TRA/StationExit?$format=JSON
```

---

### 8. Service Information

#### News & Announcements

```
GET /v3/Rail/TRA/News?$format=JSON
```

#### Service Alerts

```
GET /v3/Rail/TRA/Alert?$format=JSON
```

Returns: Service disruption and operational alerts

---

### 9. Other Resources

#### Train Types

```
GET /v3/Rail/TRA/TrainType?$format=JSON
```

Returns: Information about different train classes (e.g., 自強號, 莒光號, 區間車)

#### Transfer Information

```
GET /v3/Rail/TRA/LineTransfer?$format=JSON
GET /v3/Rail/TRA/StationTransfer?$format=JSON
```

#### Route Shapes (GeoJSON)

```
GET /v3/Rail/TRA/Shape?$format=JSON
```

#### Operator Information

```
GET /v3/Rail/TRA/Operator?$format=JSON
```

---

## Response Format

All successful responses (200 OK) include metadata wrapper:

```json
{
  "UpdateTime": "2026-02-03T10:30:00+08:00",
  "UpdateInterval": 300,
  "SrcUpdateTime": "2026-02-03T10:29:45+08:00",
  "SrcUpdateInterval": 300,
  "AuthorityCode": "TRA",
  "Count": 245
  // ... actual data array or object
}
```

### Metadata Fields

- `UpdateTime`: Platform data update time (ISO8601)
- `UpdateInterval`: Platform update cycle (seconds)
- `SrcUpdateTime`: Source platform update time
- `SrcUpdateInterval`: Source update cycle (seconds, -1 = irregular)
- `AuthorityCode`: Authority code (e.g., "TRA", "AFR")
- `Count`: Total number of records

---

## Error Responses

### 304 Not Modified

The API supports `If-Modified-Since` header for caching:

```http
GET /v3/Rail/TRA/StationLiveBoard?$format=JSON
If-Modified-Since: Mon, 03 Feb 2026 10:00:00 GMT
```

If data hasn't changed, returns `304` with empty content.

### 299 Health Check

Add `?health=true` to check API service health:

```
GET /v3/Rail/TRA/Station?health=true&$format=JSON
```

Returns service health status instead of actual data.

---

## Rate Limits & Access

### Guest Mode (No API Key)

- Browser access only
- **Basic services only** (`/api/basic` endpoints)
- Max 20 requests per IP per day

### Member Mode (With API Key)

- Full API access including **Advanced services** (`/api/advanced` endpoints)
- Rate limits based on subscription tier
- See [Pricing Page](https://tdx.transportdata.tw/pricing) for details

### Service Tiers

- **Basic Service (`/api/basic`)**: Available to all users, includes fundamental data
- **Advanced Service (`/api/advanced`)**: Requires authentication, includes spatial filtering and enhanced features

### Billing

- **Per Call:** 200 calls = 1 point
- **Per Data:** 20 MB = 1 point

---

## Metro (MRT) Endpoints

Metro endpoints use **v2 API** and are available on the **Advanced tier** (`/api/advanced`).

### 1. Metro Stations - Near By Search (Advanced)

**Endpoint:** `GET /v2/Rail/Metro/Station/NearBy`

**Description:** Find metro stations within a specified radius of a location.

**Required Parameters:**

- `$spatialFilter` (string, required): Spatial filter using format `nearby({Lat},{Lon},{DistanceInMeters})`
  - Maximum search radius: 1000 meters
  - Example: `nearby(25.047675, 121.517055, 100)`
- `$format` (string, required): Response format (`JSON` or `XML`)

**Optional Parameters:**

- `$select` (string): Select specific fields (e.g., `StationID,StationName`)
- `$filter` (string): Additional OData filters
- `$orderby` (string): Sort results
- `$top` (integer): Limit results (default: 30)
- `$skip` (integer): Skip first N results

**Example Request:**

```
GET /v2/Rail/Metro/Station/NearBy?$spatialFilter=nearby(25.047675,121.517055,500)&$format=JSON
```

**Response Schema:**

```json
[
  {
    "StationUID": "TRTC-BL11",
    "StationID": "BL11",
    "StationName": {
      "Zh_tw": "台北車站",
      "En": "Taipei Main Station"
    },
    "StationPosition": {
      "PositionLon": 121.517055,
      "PositionLat": 25.047675,
      "GeoHash": "wsqqmtr"
    },
    "StationAddress": "臺北市中正區黎明里北平西路3號B1",
    "LocationCity": "臺北市",
    "LocationCityCode": "TPE",
    "LocationTown": "中正區",
    "LocationTownCode": "63000010",
    "BikeAllowOnHoliday": true,
    "SrcUpdateTime": "2026-02-03T10:30:00+08:00",
    "UpdateTime": "2026-02-03T10:30:15+08:00",
    "VersionID": 1
  }
]
```

**Key Response Fields:**

- `StationUID`: Unique station identifier (e.g., "TRTC-BL11")
- `StationID`: Station code (e.g., "BL11")
- `StationName`: Localized station names (Zh_tw, En)
- `StationPosition`: GPS coordinates and GeoHash
- `StationAddress`: Physical address
- `LocationCity/CityCode`: City information
- `LocationTown/TownCode`: District information
- `BikeAllowOnHoliday`: Whether bicycles allowed on holidays
- `SrcUpdateTime`: Source data update time
- `UpdateTime`: Platform data update time
- `VersionID`: Data version number

**Usage Notes:**

- Requires authentication (Advanced tier)
- Maximum search radius is 1000 meters
- Returns all metro systems (Taipei, Kaohsiung, Taoyuan, etc.)
- Use `$filter` to narrow by specific metro system if needed

---

## Alishan Forest Railway (AFR)

The API also supports AFR endpoints with similar structure:

```
GET /v3/Rail/AFR/Station?$format=JSON
GET /v3/Rail/AFR/GeneralTrainTimetable?$format=JSON
GET /v3/Rail/AFR/ODFare?$format=JSON
...
```

Replace `/TRA/` with `/AFR/` in endpoint paths.

---

## Best Practices

1. **Always include `$format=JSON`** in query parameters
2. **Use filtering** to reduce data transfer: `$filter=StationID eq '1000'`
3. **Implement caching** with `If-Modified-Since` header for real-time endpoints
4. **Check health endpoint** if experiencing issues: `?health=true`
5. **Handle 304 responses** to avoid unnecessary data processing
6. **Use `$top` parameter** to limit results when exploring data
7. **Store credentials securely** - never commit API keys to version control

---

## Example: Complete Flow

### 1. Get Access Token

```typescript
const response = await fetch(
  'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
    }),
  }
);

const { access_token } = await response.json();
```

### 2. Make API Request

```typescript
const stations = await fetch(
  'https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/Station?$format=JSON&$top=10',
  {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }
);

const data = await stations.json();
console.log(data);
```

---

## Useful Links

- **TDX Portal:** https://tdx.transportdata.tw
- **API Registration:** https://tdx.transportdata.tw/register
- **API Keys:** https://tdx.transportdata.tw/user/dataservice/key
- **Pricing:** https://tdx.transportdata.tw/pricing
- **Sample Code:** https://github.com/tdxmotc/SampleCode

---

## Notes

- All times are in Taiwan timezone (UTC+8)
- Daily timetables cover approximately 60 days from current date
- Real-time data updates every ~5 minutes (300 seconds)
- Station codes are numerical strings (e.g., "1000" for Taipei)
- Train numbers are alphanumeric strings

---

Last Updated: 2026-02-03
