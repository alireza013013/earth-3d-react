import './Earth.css'
import * as THREE from "three"
import { useEffect } from 'react';
import alphaTexture from "../../assets/textures/alpha.jpg"
import particleTextureImage from "../../assets/textures/particelTexture.png"
import { getAtmosphereMat } from './glowShader';

const Earth = () => {


    useEffect(() => {

        // helper function for create wireframemode sphere
        const generateFibonacciSphere = (numPoints: number, radius: number) => {
            const points = [];
            const goldenRatio = (1 + Math.sqrt(5)) / 2;
            const angleIncrement = Math.PI * 2 * goldenRatio;

            for (let i = 0; i < numPoints; i++) {
                const t = i / numPoints;
                const inclination = Math.acos(1 - 2 * t);
                const azimuth = angleIncrement * i;

                const x = radius * Math.sin(inclination) * Math.cos(azimuth);
                const y = radius * Math.sin(inclination) * Math.sin(azimuth);
                const z = radius * Math.cos(inclination);

                points.push({ x, y, z });
            }

            return points;
        };

        const isNearby = (p1: { x: number, y: number, z: number }, p2: { x: number, y: number, z: number }, radius: number, factorDisrance: number) => {
            const distance = Math.sqrt(
                Math.pow(p1.x - p2.x, 2) +
                Math.pow(p1.y - p2.y, 2) +
                Math.pow(p1.z - p2.z, 2)
            );
            return distance < radius * factorDisrance;
        };


        // find canvas element
        const canvas = document.getElementById("canvas")

        // scene
        const scene = new THREE.Scene()
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
        camera.position.set(0, 0, 11)
        scene.add(camera)

        // texture loader
        const textureLoader = new THREE.TextureLoader()
        const earthAlphaTexture = textureLoader.load(alphaTexture)
        const particleTexture = textureLoader.load(particleTextureImage)

        // create group earth
        const earthGroup = new THREE.Group()
        scene.add(earthGroup)

        // Earth with texture in Core
        const createEarthCore = () => {
            const materialEarthCore = new THREE.MeshStandardMaterial({
                map: earthAlphaTexture,
                metalness: 0.82,
                roughness: 0.42,
            })
            const EarthCoreMesh = new THREE.Mesh(
                new THREE.SphereGeometry(3),
                materialEarthCore
            )
            earthGroup.add(EarthCoreMesh)

        }

        // Earth Sphere nearest to core
        const createSphereNearestCore = () => {
            const pointCount = 100;
            const radius = 3.08;
            // particle
            const particlesGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(pointCount * 3);
            const points = generateFibonacciSphere(pointCount, radius);
            points.forEach((point, index) => {
                positions[index * 3] = point.x;
                positions[index * 3 + 1] = point.y;
                positions[index * 3 + 2] = point.z;
            });

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particlesMaterial = new THREE.PointsMaterial({
                color: "#1db0b8",
                size: 0.3,
                transparent: true,
                alphaMap: particleTexture,
                opacity: 1,
                depthWrite: false

            });
            const particles = new THREE.Points(particlesGeometry, particlesMaterial);
            earthGroup.add(particles)

            // line triangels
            const trianglesGeometry = new THREE.BufferGeometry();
            const triangleVertices = [];
            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    for (let k = j + 1; k < points.length; k++) {
                        if (
                            isNearby(points[i], points[j], radius, 0.5) &&
                            isNearby(points[j], points[k], radius, 0.5) &&
                            isNearby(points[k], points[i], radius, 0.5)
                        ) {
                            triangleVertices.push(
                                points[i].x, points[i].y, points[i].z,
                                points[j].x, points[j].y, points[j].z,
                                points[k].x, points[k].y, points[k].z
                            );
                        }
                    }
                }
            }

            trianglesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(triangleVertices, 3));
            const trianglesMaterial = new THREE.MeshBasicMaterial({
                color: "#1db0b8",
                side: THREE.DoubleSide,
                wireframe: true,
                opacity: 0.05,
                transparent: true,
                depthWrite: true
            });
            const trianglesMesh = new THREE.Mesh(trianglesGeometry, trianglesMaterial);
            earthGroup.add(trianglesMesh)

        }

        // atmosphere
        const createAtmosphere = () => {
            const material = getAtmosphereMat()
            const glowGeometry = new THREE.SphereGeometry(3.6, 32, 32);
            const glowMesh = new THREE.Mesh(glowGeometry, material);
            scene.add(glowMesh);
        }

        // Earth Sphere farthest to core
        const createSphereFarthestCore = () => {
            const pointCount = 60;
            const radius = 4;

            // particle
            const particlesGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(pointCount * 3);
            const points = generateFibonacciSphere(pointCount, radius);
            points.forEach((point, index) => {
                positions[index * 3] = point.x;
                positions[index * 3 + 1] = point.y;
                positions[index * 3 + 2] = point.z;
            });

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particlesMaterial = new THREE.PointsMaterial({
                color: "#ffffff",
                size: 0.3,
                transparent: true,
                alphaMap: particleTexture,
                opacity: 0.8,
                depthWrite: false
            });
            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            earthGroup.add(particlesMesh)

            // line triangels
            const trianglesGeometry = new THREE.BufferGeometry();
            const triangleVertices = [];
            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    for (let k = j + 1; k < points.length; k++) {
                        if (
                            isNearby(points[i], points[j], radius, 0.62) &&
                            isNearby(points[j], points[k], radius, 0.62) &&
                            isNearby(points[k], points[i], radius, 0.62)
                        ) {
                            triangleVertices.push(
                                points[i].x, points[i].y, points[i].z,
                                points[j].x, points[j].y, points[j].z,
                                points[k].x, points[k].y, points[k].z
                            );
                        }
                    }
                }
            }

            trianglesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(triangleVertices, 3));
            const trianglesMaterial = new THREE.MeshBasicMaterial({
                color: "#ffffff",
                side: THREE.DoubleSide,
                wireframe: true,
                opacity: 0.03,
                transparent: true,
                depthWrite: false
            });
            const trianglesMesh = new THREE.Mesh(trianglesGeometry, trianglesMaterial);
            earthGroup.add(trianglesMesh)

        }

        // directional light
        const createDirectionalLight = () => {
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1)
            directionalLight.position.set(0.25, 3, 1)
            scene.add(directionalLight)
        }

        // ambient light
        const createAmbientLight = () => {
            const ambientLight = new THREE.AmbientLight(0xffffff, 1)
            scene.add(ambientLight)
        }



        // call Function For initilize
        createEarthCore()
        createSphereNearestCore()
        createAtmosphere()
        createSphereFarthestCore()
        createDirectionalLight()
        createAmbientLight()



        // renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas as HTMLCanvasElement,
            antialias: true
        })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


        // tick function
        const clock = new THREE.Clock()
        let previousTime = 0

        const tick = () => {
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - previousTime
            previousTime = elapsedTime

            // update eath group
            earthGroup.rotation.y += deltaTime * 0.2



            // update renderer
            renderer.render(scene, camera)

            // request frame
            requestAnimationFrame(tick)
        }
        tick()


        window.addEventListener("resize", () => {
            // update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            // update camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            // update renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

    }, [])



    return (
        <canvas id="canvas" className="wrbgl"></canvas>
    )
}

export default Earth