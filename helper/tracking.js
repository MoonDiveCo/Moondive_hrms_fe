import {UAParser} from "ua-parser-js";
import Cookies from "js-cookie";
import axios from "axios";
import bcrypt from 'bcryptjs'
import { resolve } from "styled-jsx/css";


const generateMachineId = (payload) => {
  return bcrypt.hashSync(payload)
}

const getGeolocationData=async ()=>{
    function success(position){
        const coordinates = position.coords
        Cookies.set('__lat',`${coordinates.latitude}`)
        Cookies.set('__long',`${coordinates.longitude}`)
        Cookies.set('_accuracy',`${coordinates.accuracy}`)
    }
    function failure(err){
        console.warn(`Error while fetching location error code-${err.code}: ${err.message} `)
    }
    if(typeof navigator!=='undefined'){
        navigator.geolocation.getCurrentPosition(success,failure)
    }
}

const fetchIPData=async ()=>{
    try{
        const response=await fetch("https://api.ipify.org/?format=json")
        const data=await response.json()
        if(data && data.ip){
            axios.defaults.headers.common["ipaddress"]=data.ip
            Cookies.set('ipaddress',data.ip)

            const existingMachineId=Cookies.get('machineid')

            if(!existingMachineId){
                const machineId=generateMachineId(data.ip)
                Cookies.set('machineid',machineId)
                axios.defaults.headers.common["machineid"]=machineId
            }else{
                axios.defaults.headers.common["machineid"]=existingMachineId
            }

            const geoLocationData=await new Promise((resolve,reject)=>{
                if(typeof navigator==='undefined'){
                    reject(new Error('Navigator not available'))
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (position)=>{
                        const coordinates=position.coords
                        Cookies.set('__lat',`${coordinates.latitude}`)
                        Cookies.set('__long',`${coordinates.longitude}`)
                        Cookies.set('__accuracy',`${coordinates.accuracy}`)
                        resolve({
                            latitude:coordinates.latitude,
                            longitude:coordinates.longitude,
                            accuracy:coordinates.accuracy
                        })
                    },(err)=>{
                        console.warn(`geolocation err : error code ${err.code}: ${err.message}`)
                    },{
                        timeout:10000,
                    }
                )
            })
            axios.defaults.headers.common["latitude"]=geoLocationData.latitude
            axios.defaults.headers.common["longitude"]=geoLocationData.longitude
            axios.defaults.headers.common["accuracy"]=geoLocationData.accuracy

            console.log("--------------------",axios.defaults.headers.common["machineid"])

            return {...data,geoLocation:geoLocationData}
        }
    }catch(err){
        console.error("error in fetchIPData: ",err)
    }
}

const getBrowserDetails=()=>{
    const parser=new UAParser();
    return parser.getResult()
}


export {getGeolocationData,fetchIPData}