package com.view;
import com.model.*;

import com.google.gson.Gson;
import com.model.Model2D;

import javax.websocket.server.ServerEndpoint;
import javax.websocket.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


@ServerEndpoint(value="/SimulationProcess")
public class SimulationProcess {

    Gson jsn=new Gson();
    int step=0;
    SimInput simInput;
    Model2D m2d;
    double[][] saturation=new double[23][23];
    double[][] pressures=new double[23][23];

    @OnOpen
    public void onOpen(Session session) {
        System.out.println("connected!");
    }

    @OnMessage
    public void onMessage(String message, Session session) {
//        System.out.println("got the message");
//        System.out.println(message);
//        double dd[][]={{1,0,1}, {2, 2, 3}};
//        double dd2[][]={{5,0,1}, {2, 2, 3}};
//        sRes.put("3",dd);
//        sRes.put("2",dd2);
//        String str=jsn.toJson(sRes);


        if(!"calculating".equals(message) && !"paused".equals(message)) {

            simInput = jsn.fromJson(message, SimInput.class);
            simInput.injectp=simInput.injectp*Math.pow(10, 6);
            simInput.productionp=simInput.productionp*Math.pow(10, 6);
            simInput.fieldp=simInput.fieldp*Math.pow(10, 6);
            simInput.fieldperm=simInput.fieldperm*Math.pow(10,-15);
            simInput.v1=simInput.v1*Math.pow(10, -3);
            simInput.v2=simInput.v2*Math.pow(10, -3);
            System.out.println(simInput.injectp);
            System.out.println(simInput.productionp);
            System.out.println(simInput.fieldperm);
            System.out.println(simInput.v1);
            System.out.println(simInput.v2);
            System.out.println(simInput.fieldp);
            System.out.println(simInput.perm);

            m2d=new Model2D(25,25,1,1,simInput.injectp,simInput.productionp,simInput.fieldperm,simInput.v1,simInput.v2,simInput.fieldp,simInput.perm);
            m2d.build();
            m2d.solve();
            saturation=m2d.saturation;
            pressures=m2d.pressures;
            Map<String, double[][]> map=new HashMap<>();
            map.put(Integer.toString(0),saturation);
            map.put(Integer.toString(1),pressures);
            String str=jsn.toJson(map);
            System.out.println(str);

            try {
                //   session.getBasicRemote().sendText("Model initialized");
                session.getBasicRemote().sendText(str);


            } catch (IOException e) {
                e.printStackTrace();
            }
        }


        if (m2d.saturation[22][22]<simInput.ends && "calculating".equals(message)) {
            m2d.solve();
            saturation = m2d.saturation;
            pressures = m2d.pressures;
            Map<String, double[][]> map = new HashMap<>();
            map.put(Integer.toString(0), saturation);
            map.put(Integer.toString(1), pressures);
            String str = jsn.toJson(map);

            try {
                session.getBasicRemote().sendText(str);
                step++;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        if ("paused".equals(message)){
            try {
                session.getBasicRemote().sendText("paused");
                step++;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        if(m2d.saturation[22][22]>=simInput.ends){
            try {
                session.getBasicRemote().sendText("terminated");
                step++;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }


    @OnError
    public void error(Session session, java.lang.Throwable throwable){
        System.err.println(throwable);
    }


    public class SimInput{
        double injectp;
        double productionp;
        double fieldperm;
        double fieldp;
        double v1;
        double v2;
        double[][] perm=new double[23][23];
        double ends;
    }

}
