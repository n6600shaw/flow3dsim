package com.model;

import org.ejml.simple.SimpleMatrix;

import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class Draw extends JPanel{

    Model2D m2d;
    //SimpleMatrix s=new SimpleMatrix();
    double[][] s;
    int dx;
    int dy;
    int width;
    int height;

    public Draw(Model2D m2d,int w,int h) {
        this.m2d = m2d;
        this.width=w;
        this.height=h;
        dx=width/(m2d.nx-2);
        dy=width/(m2d.ny-2);
        s=new double[m2d.nx-2][m2d.ny-2];
    }


    public void setM2d(Model2D m2d) {
        this.m2d = m2d;
    }
/*
    public void setS(SimpleMatrix s) {
        this.s = s;
    }*/
public void setS(double[][] s) {
    this.s = s;
}


    public void setDx(int dx) {
        this.dx = dx;
    }

    public void setDy(int dy) {
        this.dy = dy;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    @Override
    public void paint(Graphics g) {
        super.paint(g);

/*
        for (int j=1;j<m2d.ny-1;j++){

            for(int i=1;i<m2d.nx-1;i++){
                Block b=m2d.blocks[i][j];
                //double rate=(-b.pressure+m2d.inPressure)/(m2d.inPressure-m2d.outPressure);
                double rate=b.s1;
                float ratef=(float) rate;
                System.out.println(ratef);
                Color color=new Color(0,0,ratef);

                g.setColor(color);

                g.fillRect((j-1)*dx,(i-1)*dy,dx,dy);



            }
        }*/

        for (int j=0;j<m2d.ny-2;j++){

            for(int i=0;i<m2d.nx-2;i++){

                //double rate=(-b.pressure+m2d.inPressure)/(m2d.inPressure-m2d.outPressure);
                //double rate=s.get(j,i);
                double rate=s[i][j];
                float ratef=(float) rate;
               // System.out.println(ratef);
                Color color=new Color(0,ratef*0.4f,ratef*0.8f);

                g.setColor(color);

                g.fillRect((j-1)*dx,(i-1)*dy,dx,dy);



            }
        }


    }
}
