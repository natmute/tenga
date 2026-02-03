import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories } from '@/data/mockData';

const CategorySection = () => {
  return (
    <section className="py-12 md:py-16 bg-secondary/50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold sm:text-3xl"
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-muted-foreground"
          >
            Find exactly what you're looking for
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/category/${category.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-background p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
              >
                <span className="text-4xl">{category.icon}</span>
                <div className="text-center">
                  <span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {category.productCount.toLocaleString()} items
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
