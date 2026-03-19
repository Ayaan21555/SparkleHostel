import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Pricing() {
  const prices = [
    { name: 'Shirt / T-Shirt / Kurta / Top', price: '₹15', category: 'Essential' },
    { name: 'Pant / Leggings', price: '₹15', category: 'Essential' },
    { name: 'Jeans / Saree + Blouse', price: '₹20', category: 'Premium' },
    { name: 'Bedsheet + Pillow Cover', price: '₹25', category: 'Large' },
    { name: 'Blanket', price: '₹40', category: 'Heavy' },
    { name: 'Bath Towel', price: '₹40', category: 'Heavy' },
  ]

  return (
    <section id="pricing" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Badge variant="outline" className="px-4 py-1 mb-6 text-primary border-primary/20 bg-primary/5">
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter">Premium Laundry Pricing</h2>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg">
            High-quality washing at affordable student prices. Quality and care for every garment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {prices.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="glass h-full relative overflow-hidden hover:border-primary/50 transition-colors">
                <div className="absolute top-0 right-0 p-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {item.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl mt-4 font-serif italic text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">{item.price}</span>
                    <span className="text-muted-foreground text-sm font-medium">/ per piece</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
