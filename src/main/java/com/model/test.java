package com.model;


import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;

public class test {
    public static void main(String[] args) {
        String test="";
        Model2D m2d=new Model2D(25,25,1,1,40000000,15000000,2 * Math.pow(10,-13), 0.4* Math.pow(10, -3),0.8 * Math.pow(10, -3),20000000);
        m2d.build();
        int count=0;
        while (count<10){
        m2d.solve();
        count++;}


        Map<String, double[][]> sRes = new HashMap<String, double[][]>();


        //put saturation into map, convert map to json
        for (int i=0;i<m2d.sSequence.size();i++)
        sRes.put(Integer.toString(i),m2d.sSequence.get(i));
        Gson jsn=new Gson();

        String str=jsn.toJson(sRes);
        String[] strs=str.split("]]");
        for (int i=0;i<strs.length;i++){

            System.out.println(strs[i]);
        }


    }
}
