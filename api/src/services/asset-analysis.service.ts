import { FeatureCollection, Feature, Polygon, MultiPolygon, GeoJsonProperties, Point, Position, Geometry } from 'geojson';
import { AssetLocationRequestDto } from '../models/asset-location-request.model';
import { DataProviderUtils } from '../utils/data-provider.utils';
import * as turf from '@turf/turf';
import { DataLayerDto } from '../models/data-layer.model';

/*
 * A service which provides access to analysis operations like location and suitability for different assets.
 */
export class AssetAnalysisService {
    constructor(private readonly dataProviderUtils: DataProviderUtils) {}

    /*
     * A helper method to get the maximum distance for a multipolygon from the provided centroid. The provided centroid should be the centroid of the multipolygon
     */
    private getMaxDistanceFromCentroid(geometry: MultiPolygon, centroid: Feature<Point>): number {
        let maxDistanceFromCentroid = 0;
        geometry.coordinates.forEach((innerCoordinates: Position[][]) => {
            innerCoordinates[0].forEach((polygonCoordinates) => {
                const point = turf.point(polygonCoordinates);
                const distance = turf.distance(centroid, point, { units: 'kilometers' });
                maxDistanceFromCentroid = Math.max(maxDistanceFromCentroid, distance);
            });
        });

        return maxDistanceFromCentroid;
    }

    /*
     * A helped method to create two circles that envelope the provided multipolygon one have a radius of the maximum distance from the centoid + the minimum distance provided and the other having a redius of the maximum distance from the centroid + the minimum distance provided + 0.5km
     */
    private getCircleEnvelopesForFeature(feature: Feature<MultiPolygon>, minDistance: number): Feature<Polygon>[] {
        const centroid = turf.centroid(feature);
        const maxDistanceFromCentroid = this.getMaxDistanceFromCentroid(feature.geometry, centroid);
        return [
            turf.circle(centroid, maxDistanceFromCentroid + minDistance, { units: 'kilometers' }),
            turf.circle(centroid, maxDistanceFromCentroid + minDistance + 0.5, { units: 'kilometers' }),
        ];
    }

    /*
     * A helped method to get the matched polygons for the provided layer based on the provided location. The matched polygons are provided a the passed in suitability rating and the issue description.
     */
    private getMatchedPolygonsForLayer(
        layer: FeatureCollection<MultiPolygon | Polygon>,
        location: Feature<Polygon>,
        suitability: string,
        issue?: string
    ): Feature<Polygon | MultiPolygon, GeoJsonProperties>[] {
        const matchedPolygons: Feature<Polygon | MultiPolygon, GeoJsonProperties>[] = [];
        layer.features.forEach((layerFeature) => {
            if (layerFeature.geometry.type === 'MultiPolygon') {
                layerFeature.geometry.coordinates.forEach((position) => {
                    const polygon = turf.polygon(position);
                    const combinedFeatureCollection = { type: 'FeatureCollection', features: [location, polygon] } as FeatureCollection<Polygon>;
                    const intersection = turf.intersect(combinedFeatureCollection);

                    if (intersection) {
                        intersection.properties!.suitability = suitability;
                        if (issue) intersection.properties!.issue = issue;
                        matchedPolygons.push(intersection);
                    }
                });
            } else {
                const polygon = turf.polygon(layerFeature.geometry.coordinates);
                const combinedFeatureCollection = { type: 'FeatureCollection', features: [location, polygon] } as FeatureCollection<Polygon>;
                const intersection = turf.intersect(combinedFeatureCollection);

                if (intersection) {
                    intersection.properties!.suitability = suitability;
                    if (issue) intersection.properties!.issue = issue;
                    matchedPolygons.push(intersection);
                }
            }
        });

        return matchedPolygons;
    }

    /*
     * A helper method to get the matched polygons based on the data layers and location provided. These polygons are order with the good layers (suitability rating of green) -> caution layers (suitability rating of amber) -> bad layers (suitability of red) -> exact bad layers (suitability rating of darkRed)
     *
     * Good layers are comprised of polygons where the ws_spring1 property matches the provided user attribute range
     * Caution layers are comprised of polygons where the minimum distance from a bad layer is 0.5 km.
     * Bad layers are comprised of polygons which envelope the polygons in the exact bad layer and account for the provided minimum distance attribute
     * Exact bad layers are comprised of polygons loaded from the specific data layers files.
     */
    private getMatchedPolygonsForLayers(dataLayers: DataLayerDto[], location: Feature<Polygon>): Feature<MultiPolygon | Polygon, GeoJsonProperties>[] {
        let goodLayerMatchedPolygons: Feature<MultiPolygon | Polygon, GeoJsonProperties>[] = [];
        let cautionLayerMatchedPolygons: Feature<MultiPolygon | Polygon, GeoJsonProperties>[] = [];
        let badLayerMatchedPolygons: Feature<MultiPolygon | Polygon, GeoJsonProperties>[] = [];
        let exactbadLayerMatchedPolygons: Feature<MultiPolygon | Polygon, GeoJsonProperties>[] = [];

        dataLayers.forEach((dataLayer) => {
            if (dataLayer.id === 'windSpeed') {
                const minSpeed = dataLayer.attributes.find((attribute) => attribute.id === 'minSpeed')?.value || 4;
                const maxSpeed = dataLayer.attributes.find((attribute) => attribute.id === 'maxSpeed')?.value || 7.5;
                const windspeedLayer = this.dataProviderUtils.getWindspeedLayerData();
                const windspeedGoodLayerData: FeatureCollection<MultiPolygon> = {
                    type: 'FeatureCollection',
                    features: windspeedLayer.features.filter(
                        (feature) => feature.properties!.ws_spring1 >= minSpeed && feature.properties!.ws_spring1 <= maxSpeed
                    ),
                };
                const windspeedBadLayerData: FeatureCollection<MultiPolygon> = {
                    type: 'FeatureCollection',
                    features: windspeedLayer.features.filter(
                        (feature) => feature.properties!.ws_spring1 < minSpeed || feature.properties!.ws_spring1 > maxSpeed
                    ),
                };

                goodLayerMatchedPolygons = this.getMatchedPolygonsForLayer(windspeedGoodLayerData, location, 'green');

                badLayerMatchedPolygons = badLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(windspeedBadLayerData, location, 'red', `Bad windspeed - < ${minSpeed}m/s or > ${maxSpeed}m/s`)
                );
            } else if (dataLayer.id === 'specialAreasOfConservation') {
                const minDistance: number = dataLayer.attributes.find((attribute) => attribute.id === 'minDistance')?.value || 1;
                const specialAreasOfConservationLayerData = this.dataProviderUtils.getSpecialAreasOfConservationLayerData();
                const specialAreasOfConservationBufferedFeatures: Feature<Polygon>[] = [];
                const specialAreasOfConservationBuffered500MFeatures: Feature<Polygon>[] = [];

                specialAreasOfConservationLayerData.features.forEach((feature) => {
                    const bufferedFeatures = this.getCircleEnvelopesForFeature(feature, minDistance);
                    specialAreasOfConservationBufferedFeatures.push(bufferedFeatures[0]);
                    specialAreasOfConservationBuffered500MFeatures.push(bufferedFeatures[1]);
                });
                const specialAreasOfConservationBufferedLayerData: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: specialAreasOfConservationBufferedFeatures,
                };

                const specialAreasOfConservationBuffered500MLayerData: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: specialAreasOfConservationBuffered500MFeatures,
                };

                exactbadLayerMatchedPolygons = exactbadLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        specialAreasOfConservationLayerData,
                        location,
                        'darkRed',
                        `Too close to special areas of conservation - <= ${minDistance}km`
                    )
                );
                badLayerMatchedPolygons = badLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        specialAreasOfConservationBufferedLayerData,
                        location,
                        'red',
                        `Too close to special areas of conservation - <= ${minDistance}km`
                    )
                );
                cautionLayerMatchedPolygons = cautionLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        specialAreasOfConservationBuffered500MLayerData,
                        location,
                        'amber',
                        `Close to special areas of conservation - <= ${minDistance + 0.5}km`
                    )
                );
            } else if (dataLayer.id == 'sitesOfSpecialScientificInterest') {
                const minDistance: number = dataLayer.attributes.find((attribute) => attribute.id === 'minDistance')?.value || 1;
                const sitesOfSpecialScientificInterestLayerData = this.dataProviderUtils.getSitesOfSpecialScientificInterestLayerData();
                const sitesOfSpecialScientificInterestBufferedFeatures: Feature<Polygon>[] = [];
                const sitesOfSpecialScientificInterestBuffered500MFeatures: Feature<Polygon>[] = [];

                sitesOfSpecialScientificInterestLayerData.features.forEach((feature) => {
                    const bufferedFeatures = this.getCircleEnvelopesForFeature(feature, minDistance);
                    sitesOfSpecialScientificInterestBufferedFeatures.push(bufferedFeatures[0]);
                    sitesOfSpecialScientificInterestBuffered500MFeatures.push(bufferedFeatures[1]);
                });

                const sitesOfSpecialScientificInterestBufferLayerData: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: sitesOfSpecialScientificInterestBufferedFeatures,
                };
                const sitesOfSpecialScientifiInterestBuffer500MLayerData: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: sitesOfSpecialScientificInterestBuffered500MFeatures,
                };

                exactbadLayerMatchedPolygons = exactbadLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        sitesOfSpecialScientificInterestLayerData,
                        location,
                        'darkRed',
                        `Too close to sites of special scientific interest - <= ${minDistance}km`
                    )
                );
                badLayerMatchedPolygons = badLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        sitesOfSpecialScientificInterestBufferLayerData,
                        location,
                        'red',
                        `Too close to sites of special scientific interest - <= ${minDistance}km`
                    )
                );
                cautionLayerMatchedPolygons = cautionLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        sitesOfSpecialScientifiInterestBuffer500MLayerData,
                        location,
                        'amber',
                        `Close to sites of special scientific interest - <= ${minDistance + 0.5}km`
                    )
                );
            } else if (dataLayer.id === 'builtUpAreas') {
                const minDistance: number = dataLayer.attributes.find((attribute) => attribute.id === 'minDistance')?.value || 1;
                const builtupAreasLayerData = this.dataProviderUtils.getBuiltupAreasLayerData();
                const builtupAreasBufferedFeatures: Feature<Polygon>[] = [];
                const builtupAreasBuffered500MFeatures: Feature<Polygon>[] = [];

                builtupAreasLayerData.features.forEach((feature) => {
                    const bufferedFeatures = this.getCircleEnvelopesForFeature(feature, minDistance);
                    builtupAreasBufferedFeatures.push(bufferedFeatures[0]);
                    builtupAreasBuffered500MFeatures.push(bufferedFeatures[1]);
                });

                const builtupAreasBufferLayerData: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: builtupAreasBufferedFeatures,
                };
                const builtupAreasBuffer500MLayerData: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: builtupAreasBuffered500MFeatures,
                };

                exactbadLayerMatchedPolygons = exactbadLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(builtupAreasLayerData, location, 'darkRed', `Too close to built up areas - <= ${minDistance}km`)
                );
                badLayerMatchedPolygons = badLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(builtupAreasBufferLayerData, location, 'red', `Too close to built up areas - <= ${minDistance}km`)
                );
                cautionLayerMatchedPolygons = cautionLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(builtupAreasBuffer500MLayerData, location, 'amber', `Close to built up areas - <= ${minDistance + 0.5}km`)
                );
            } else if (dataLayer.id == 'areasOfOutstandingNaturalBeauty') {
                const minDistance: number = dataLayer.attributes.find((attribute) => attribute.id === 'minDistance')?.value || 1;
                const areasOfNaturalBeautyLayerData = this.dataProviderUtils.getAreasOfNaturalBeautyLayerData();
                const areasOfNaturalBeautyBufferedFeatures: Feature<Polygon>[] = [];
                const areasOfNaturalBeautyBuffered500MFeatures: Feature<Polygon>[] = [];

                areasOfNaturalBeautyLayerData.features.forEach((feature) => {
                    const bufferedFeatures = this.getCircleEnvelopesForFeature(feature, minDistance);
                    areasOfNaturalBeautyBufferedFeatures.push(bufferedFeatures[0]);
                    areasOfNaturalBeautyBuffered500MFeatures.push(bufferedFeatures[1]);
                });

                const areasOfNaturalBeautyBufferLayerData: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: areasOfNaturalBeautyBufferedFeatures,
                };
                const areasOfNaturalBeautyBufferLayer500MData: FeatureCollection<MultiPolygon | Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: areasOfNaturalBeautyBuffered500MFeatures,
                };

                exactbadLayerMatchedPolygons = exactbadLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        areasOfNaturalBeautyLayerData,
                        location,
                        'darkRed',
                        `Too close to areas of outstanding natural beauty - <= ${minDistance}km`
                    )
                );
                badLayerMatchedPolygons = badLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        areasOfNaturalBeautyBufferLayerData,
                        location,
                        'red',
                        `Too close to areas of outstanding natural beauty - <= ${minDistance}km`
                    )
                );
                cautionLayerMatchedPolygons = cautionLayerMatchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        areasOfNaturalBeautyBufferLayer500MData,
                        location,
                        'amber',
                        `Close to areas of outstanding natural beauty - <= ${minDistance + 0.5}km`
                    )
                );
            }
        });

        return [...goodLayerMatchedPolygons, ...cautionLayerMatchedPolygons, ...badLayerMatchedPolygons, ...exactbadLayerMatchedPolygons];
    }
    /*
     * A method to analayze the location sent by the user along with the data layers they choose to include for analysis and return a number of polygons with a suitability rating for placing an asset.
     */
    public analyzeLocation(req: AssetLocationRequestDto): FeatureCollection<Geometry> {
        const locationPolygon = turf.polygon(req.location.features![0].geometry.coordinates);
        const dataLayersToBeAnalysed = req.dataLayers.filter((dataLayer) => dataLayer.analyze);

        const matchedPolygons = this.getMatchedPolygonsForLayers(dataLayersToBeAnalysed, locationPolygon);
        const featureCollection: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [...matchedPolygons],
        };

        return featureCollection;
    }
}
